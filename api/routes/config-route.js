const log4js = require('log4js')
const express = require('express')

const config = require('../config')
const db = require('../db')

let logger = log4js.getLogger('api')

let router = express.Router()

const configDefaults = {
  recharge: {
    default: []
  },
  transactionMaxValue: {
    default: 2000
  }
}

router.get('/', (req, res, next) => {
  db.query('SELECT `key`,value FROM config WHERE `key` IN (?)', [Object.keys(configDefaults)]).then(rows => {
    let obj = {}
    for (let key of Object.keys(configDefaults)) {
      let row = rows.find(row => row.key === key)
      if (row) {
        obj[key] = JSON.parse(row.value)
      } else {
        obj[key] = configDefaults[key].default
      }
    }
    res.json(obj)
  }).catch(err => {
    next(err)
  })
})

router.put('/recharge', (req, res, next) => {
  req.checkBody('value').isIntArray({ min: 1, max: config.transactionMaxValue })
  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }
  let value = [...new Set(req.body.value)].sort((a, b) => a - b)
  value = JSON.stringify(value)
  db.query('INSERT INTO config SET ? ON DUPLICATE KEY UPDATE ?', [{ key: 'recharge', value }, { value }]).then(rows => {
    res.json({})
  }).catch(err => {
    next(err)
  })
})

module.exports = router
