import Stripe from 'stripe'
import dotenv from 'dotenv'
import User from '../models/user.model.js'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

export const createPackage = async ({ name, description, amount, interval = 'month', currency = 'usd' }) => {

    const unit_amount = Math.round(amount * 100)

    const product = await stripe.products.create({ name, description })

    const price = await stripe.prices.create({
        unit_amount,
        currency,
        recurring: { interval },
        product: product.id
    })

    const data = {
        name: product.name,
        description: product.description,
        amount: price.unit_amount / 100,
        interval: price.recurring.interval,
        currency: price.currency,
        product_id: product.id,
        id: price.id
    }

    return data

}

export const getAllPackages = async (filters = {}) => {

    const prices = await stripe.prices.list({ limit: 100, expand: ['data.product'], ...filters })

    const packages = prices.data.map(price => {

        const product = price.product

        return {
            product_id: product.id,
            id: price.id,
            name: product.name,
            description: product.description,
            amount: price.unit_amount / 100,
            interval: price.recurring.interval,
            currency: price.currency
        }

    })

    return packages

}

export const getPackageDetails = async (id) => {

    if (!id) throw new Error('Id is required')

    const price = await stripe.prices.retrieve(id, { expand: ['product'] })

    if (!price || !price.product) {
        return null
    }

    const product = price.product

    return {
        product_id: product.id,
        id: price.id,
        name: product.name,
        description: product.description || '',
        amount: price.unit_amount / 100,
        interval: price.recurring.interval,
        currency: price.currency
    }

}

export const subscribe = async (id, user_id) => {

    const user = await User.findById(user_id)

    if (!user) throw new Error('User not found')

    let customer_id = user.stripe_customer_id

    if (!customer_id) {

        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: {
                user_id: user._id.toString()
            }
        })

        customer_id = customer.id
        user.stripe_customer_id = customer_id
        await user.save()

    }

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customer_id,
        line_items: [
            {
                price: id,
                quantity: 1
            }
        ],
        success_url: "https://www.google.com/",
        cancel_url: "https://www.google.com/",
    })

    return {
        checkout_url: session.url,
        session_id: session.id
    }
}

export const cancelActiveSubscription = async (user_id) => {

    const user = await User.findById(user_id)
    if (!user) throw new Error('User not found')

    if (!user.stripe_customer_id) {
        throw new Error('User does not have a Stripe customer ID')
    }

    const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'active',
        limit: 1
    })

    if (!subscriptions.data.length) {
        throw new Error('No active subscription found for user')
    }

    const active_subscription = subscriptions.data[0]

    const subscription = await stripe.subscriptions.del(active_subscription.id)

    return {
        id: subscription.id,
        status: subscription.status,
        canceled_at: subscription.canceled_at
    }

}

export const getUserSubscriptionLogs = async (id) => {

    const user = await User.findById(id)

    if (!user) throw new Error('User not found')
    if (!user.stripe_customer_id) throw new Error('User does not have a Stripe customer ID')

    const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'all'
    })

    const result = []

    for (const sub of subscriptions.data) {

        const items = await stripe.subscriptionItems.list({
            subscription: sub.id,
            expand: ['data.price.product']
        })

        for (const item of items.data) {

            const price = item.price
            const product = price.product

            result.push({
                subscribed_on: new Date(sub.start_date * 1000),
                expires_on: new Date(sub.current_period_end * 1000),
                interval: price.recurring?.interval || null,
                amount: price.unit_amount / 100,
                name: product?.name || null
            })
        }
    }

    return result.sort((a, b) => b.subscribed_on - a.subscribed_on)

}

export const toggleAutoRenew = async (id) => {

    const active_subscription = await getActiveSubscription(id)

    if (!active_subscription) {
        throw new Error('No active subscription found for user')
    }

    const subscription = await stripe.subscriptions.update(active_subscription.id, {
        cancel_at_period_end: !active_subscription.cancel_at_period_end
    })

    return {
        id: subscription.id,
        auto_renew: !subscription.cancel_at_period_end,
        current_period_end: new Date(subscription.current_period_end * 1000),
        status: subscription.status
    }

}

export const getActiveSubscription = async (id) => {

    const user = await User.findById(id)

    if (!user) throw new Error('User not found')
    if (!user.stripe_customer_id) throw new Error('User does not have a Stripe customer ID')

    const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: 'active',
        limit: 1
    })

    if (!subscriptions.data.length) return null

    const active_subscription = subscriptions.data[0]

    return {
        id: active_subscription.id,
        product_id: active_subscription.items.data[0].price.product,
        price_id: active_subscription.items.data[0].price.id,
        amount: active_subscription.items.data[0].price.unit_amount / 100,
        currency: active_subscription.items.data[0].price.currency,
        interval: active_subscription.items.data[0].price.recurring.interval,
        subscribed_on: new Date(active_subscription.start_date * 1000),
        current_period_end: new Date(active_subscription.current_period_end * 1000),
        cancel_at_period_end: active_subscription.cancel_at_period_end,
        status: active_subscription.status
    }

}