'use strict'
const log4js = require('log4js')

const config = require('./config')
const app = require('./app')

let logger = log4js.getLogger()

app.listen(config.server.port, config.server.ip, () => {
  logger.info('Listening on port', config.server.port)
})
