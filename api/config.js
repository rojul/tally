const config = {
  server: {
    port: process.env.PORT || 80,
    ip: '0.0.0.0',
    cors: true
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'db',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'tally',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DB || 'tally'
  },
  metrics: {
    defaultDays: 30,
    maxDays: 365
  },
  userNameLength: { min: 1, max: 30 },
  transactionMaxValue: 2000 // TODO get from db
}

module.exports = config
