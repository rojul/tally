const log4js = require('log4js')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const expressValidator = require('express-validator')
const validator = require('validator')

const version = require('../package.json').version
const config = require('../config')
const users = require('./users')
const products = require('./products')
const metrics = require('./metrics')
const transactions = require('./transactions')
const configRoute = require('./config-route')

let logger = log4js.getLogger('api')

let router = express.Router()
if (config.server.cors) {
  router.use(cors())
}
router.use(bodyParser.json())
router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache')
  next()
})
router.use(expressValidator({
  customSanitizers: {
    toName: name => {
      return name.trim()
    }
  },
  customValidators: {
    isIntArray: (values, prop) => {
      return !!values && values.every(function (val) {
        return validator.isInt(val, prop)
      })
    },
    isBoolean: (values, prop) => {
      return typeof (values) === 'boolean'
    }
  }
}))

router.use('/users', users)
router.use('/products', products)
router.use('/metrics', metrics)
router.use('/config', configRoute)
router.use('/transactions', transactions)

router.get('/', (req, res, next) => {
  res.send('Tally API ' + version)
})

router.get('/health', (req, res, next) => {
  res.json({ status: 'ok' })
})

router.get('/version', (req, res, next) => {
  res.json({ version })
})

router.all('*', (req, res) => {
  res.status(404).json({ error: 'Resource Not Found' })
})

router.use((err, req, res, next) => {
  logger.error(err.stack || err.message)
  if (res.headersSent) {
    return next(err)
  }
  res.status(500).json({ error: 'Internal Server Error' })
})

module.exports = router
