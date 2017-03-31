const log4js = require('log4js')
const express = require('express')
const mysql = require('mysql')

const config = require('../config')
const db = require('../db')

let logger = log4js.getLogger('api')

let router = express.Router({ mergeParams: true })

const validateTransactionSchema = {
  value: {
    isInt: {
      options: [{ min: -config.transactionMaxValue, max: config.transactionMaxValue }]
    }
  }
}

const validateTransactionGetSchema = {
  before: {
    optional: true,
    isInt: true
  },
  limit: {
    optional: true,
    isInt: true
  }
}

router.get('/', (req, res, next) => {
  req.checkQuery(validateTransactionGetSchema)

  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }

  let before = req.query.before ? 'AND id < ' + mysql.escape(Number(req.query.before)) : ''
  let limit = req.query.limit ? Number(req.query.limit) : 30

  let transactions = db.query('SELECT id, value, UNIX_TIMESTAMP(created) AS created FROM transaction WHERE user_id = ? ' + before + ' ORDER BY id DESC LIMIT ?', [req.params.userId, limit])
  let balance = db.queryOne('SELECT IFNULL(SUM(value), 0) AS balance FROM transaction WHERE user_id = ?', req.params.userId)
  Promise.all([transactions, balance]).then(([transactions, user]) => {
    user.transactions = transactions
    res.json(user)
  }).catch(err => {
    next(err)
  })
})

router.post('/', (req, res, next) => {
  req.checkBody(validateTransactionSchema)

  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }

  let transaction = {
    value: req.body.value,
    user_id: req.params.userId
  }
  db.query('INSERT INTO transaction SET ?', [transaction]).then(rows => {
    res.json({
      transactionId: rows.insertId
    })
  }).catch(err => {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({
        error: 'user not found'
      })
    }
    next(err)
  })
})

module.exports = router
