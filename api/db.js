const log4js = require('log4js')
const mysql = require('mysql')

const config = require('./config')

let logger = log4js.getLogger('db')

let pool = mysql.createPool(config.mysql)

exports.query = (query, values) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err)
      }
      let sql = connection.query(query, values, (err, rows) => {
        connection.release()
        if (err) {
          return reject(err)
        }
        resolve(rows)
      })
      logger.debug(sql.sql)
    })
  })
}

exports.queryOne = (query, values) => {
  return new Promise((resolve, reject) => {
    this.query(query, values).then(rows => {
      if (rows.length === 1) {
        resolve(rows[0])
      } else if (rows.length === 0) {
        resolve()
      } else {
        reject(new Error('More than one row in queryOne'))
      }
    }).catch(err => {
      reject(err)
    })
  })
}

exports.loadInDB = (query, values) => {
  let connection = mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    multipleStatements: true
  })
  connection.connect()
  return new Promise((resolve, reject) => {
    let sql = connection.query(query, values, function (err, rows) {
      connection.end()
      if (err) { return reject(err) }
      resolve(rows)
    })
    logger.info(sql.sql)
  })
}
