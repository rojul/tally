const log4js = require('log4js')
const express = require('express')

const config = require('../config')
const db = require('../db')
const userTransactions = require('./user-transactions')

let logger = log4js.getLogger('api')

let router = express.Router()

router.param('userId', (req, res, next, userId) => {
  req.checkParams('userId', 'Invalid userId').notEmpty().isInt()
  next()
})

router.use('/:userId/transactions', userTransactions)

const validateUserSchema = {
  name: {
    isLength: {
      options: [config.userNameLength]
    }
  }
}

const userSelect = `SELECT user.id, user.name, IFNULL(SUM(transaction.value), 0) AS balance, UNIX_TIMESTAMP(user.created) AS created, UNIX_TIMESTAMP(COALESCE(MAX(transaction.created), user.created)) AS active
FROM user
LEFT JOIN transaction ON user.id = transaction.user_id `

router.get('/', (req, res, next) => {
  db.query(userSelect + `GROUP BY user.id
    `).then(users => {
      res.json({ users })
    }).catch(err => {
      next(err)
    })
})

router.post('/', (req, res, next) => {
  req.sanitizeBody('name').toName()
  req.checkBody(validateUserSchema)

  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }

  let user = {
    name: req.body.name
  }
  db.query('INSERT INTO user SET ?', [user]).then(rows => {
    res.json({
      userId: rows.insertId
    })
  }).catch(err => {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'duplicate name'
      })
    }
    next(err)
  })
})

router.get('/:userId', (req, res, next) => {
  let errors = req.validationErrors()
  if (errors) { return res.status(400).json({ errors }) }

  let users = db.queryOne(userSelect + `WHERE user.id = ?
GROUP BY user.id
    `, [req.params.userId])
  let transactions = db.query('SELECT id, value, UNIX_TIMESTAMP(created) AS created FROM transaction WHERE user_id = ? ORDER BY created DESC LIMIT 5', req.params.userId)
  Promise.all([users, transactions]).then(([user, transactions]) => {
    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }
    user.transactions = transactions
    res.json(user)
  }).catch(err => {
    next(err)
  })
})

router.put('/:userId', (req, res, next) => {
  req.sanitizeBody('name').toName()
  req.checkBody(validateUserSchema)

  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }

  let user = {
    name: req.body.name
  }
  db.query('UPDATE user SET ? WHERE id = ?', [user, req.params.userId]).then(rows => {
    if (rows.affectedRows === 1) {
      res.json({})
    } else {
      res.status(404).json({ error: 'user not found' })
    }
  }).catch(err => {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'duplicate name'
      })
    }
    next(err)
  })
})

router.delete('/:userId', (req, res, next) => {
  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }

  db.query('DELETE FROM user WHERE id = ?', [req.params.userId]).then(rows => {
    if (rows.affectedRows === 1) {
      res.json({})
    } else { res.status(404).json({ error: 'user not found' }) }
  }).catch(err => {
    next(err)
  })
})

module.exports = router
