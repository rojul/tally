const express = require('express')

const config = require('../config')
const db = require('../db')

let router = express.Router()

const configDefaults = {
  recharge: {
    default: [],
    parse: true
  },
  transactionMaxValue: {
    default: 2000,
    parse: true
  },
  title: {
    default: 'Tally'
  },
  theme: {
    default: 'default'
  },
  funChanceToWin: {
    default: 0,
    parse: true
  }
}

router.get('/', (req, res, next) => {
  db.query('SELECT `key`,value FROM config WHERE `key` IN (?)', [Object.keys(configDefaults)]).then(rows => {
    let obj = {}
    for (let key of Object.keys(configDefaults)) {
      let row = rows.find(row => row.key === key)
      if (row) {
        obj[key] = configDefaults[key].parse ? JSON.parse(row.value) : row.value
      } else {
        obj[key] = configDefaults[key].default
      }
    }
    res.json(obj)
  }).catch(err => {
    next(err)
  })
})

const updateConfig = (req, res, next, key, value) => {
  let query
  if (value === undefined || value === configDefaults[key].default) {
    query = db.query('DELETE FROM config WHERE ?', [{ key }])
  } else {
    query = db.query('INSERT INTO config SET ? ON DUPLICATE KEY UPDATE ?', [{ key, value }, { value }])
  }
  query.then(rows => {
    res.json({})
  }).catch(err => {
    next(err)
  })
}

router.put('/recharge', (req, res, next) => {
  req.checkBody('value').isIntArray({ min: 1, max: config.transactionMaxValue })
  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }
  let value = [...new Set(req.body.value)].sort((a, b) => a - b)
  value = JSON.stringify(value)
  updateConfig(req, res, next, 'recharge', value)
})

router.delete('/recharge', (req, res, next) => {
  updateConfig(req, res, next, 'recharge')
})

for (let route of ['title', 'theme']) {
  router.put('/' + route, (req, res, next) => {
    req.checkBody('value').len(1, 255)
    let errors = req.validationErrors()
    if (errors) {
      return res.status(400).json({ errors })
    }
    let value = req.body.value
    updateConfig(req, res, next, route, value)
  })

  router.delete('/' + route, (req, res, next) => {
    updateConfig(req, res, next, route)
  })
}

for (let route of ['funChanceToWin']) {
  router.put('/' + route, (req, res, next) => {
    req.checkBody('value').isInt({ min: 0 })
    let errors = req.validationErrors()
    if (errors) {
      return res.status(400).json({ errors })
    }
    let value = Number(req.body.value)
    updateConfig(req, res, next, route, value)
  })

  router.delete('/' + route, (req, res, next) => {
    updateConfig(req, res, next, route)
  })
}

module.exports = router
