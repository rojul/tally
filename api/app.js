const log4js = require('log4js')
const express = require('express')

const api = require('./routes/api')

let app = express()
app.disable('x-powered-by')

if (process.env.NODE_ENV === undefined) {

} else if (process.env.NODE_ENV === 'test') {
  log4js.configure({})
} else if (process.env.NODE_ENV === 'production') {

}

let logger = log4js.getLogger('app')

app.use('/api', api)
app.use(express.static('dist'))

app.all('*', (req, res) => {
  res.status(404).send('404 Not found')
})

app.use((err, req, res, next) => {
  logger.error(err.stack || err.message)
  if (res.headersSent) {
    return next(err)
  }
  res.status(500).send('500 Internal Server Error')
})

module.exports = app
