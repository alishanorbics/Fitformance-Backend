import { createRequire } from 'module'
import firebase from 'firebase-admin'
import logger from './logger.js'

const require = createRequire(import.meta.url)
const service_account = require('./fitformance.json')

firebase.initializeApp({
    credential: firebase.credential.cert(service_account),
})

logger.info('Firebase Admin Initialized')

export default firebase
