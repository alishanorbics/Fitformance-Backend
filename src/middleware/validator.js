const validator = (schema, options = { optional: false }) => (req, res, next) => {

    const { optional } = options

    if (!req.body || Object.keys(req.body).length === 0) {
        if (optional) {
            return next()
        } else {
            return res.status(400).json({
                success: false,
                message: 'Request body is missing or empty.',
            })
        }
    }

    const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.details.map((err) => err.message),
        });
    }

    req.body = value
    next()

}

export default validator