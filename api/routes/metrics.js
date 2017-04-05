const express = require('express')

const config = require('../config')
const db = require('../db')

let router = express.Router({ mergeParams: true })

const validateMetricsOptions = {
  days: {
    optional: true,
    isInt: {
      options: [{ min: 1, max: config.metrics.maxDays }]
    }
  }
}

const eachDay = (data, days) => {
  let now = new Date()
  let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() / 1000
  return [...Array(days)].map(() => {
    let dataForDay = data.find(day => day.date === date)
    let emptyDay = {
      date,
      transactions: 0,
      activeUsers: 0,
      chargeBalance: 0,
      payBalance: 0
    }
    date -= 60 * 60 * 24
    return dataForDay || emptyDay
  })
}

router.get('/', (req, res, next) => {
  req.checkQuery(validateMetricsOptions)
  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }
  let days = Number(req.query.days) || config.metrics.defaultDays

  let metrics = db.queryOne(`
select count(*) transactions, sum(value) balance, (select count(*) from user) users
from transaction
`)
  let perDay = db.query(`
select UNIX_TIMESTAMP(date(created)) date, count(*) transactions, count(distinct user_id) activeUsers,
  SUM(CASE WHEN value>0 THEN value ELSE 0 END) chargeBalance,
  SUM(CASE WHEN value<0 THEN -value ELSE 0 END) payBalance
from transaction group by date(created)
ORDER BY date LIMIT ?
`, [days])
  Promise.all([metrics, perDay]).then(([metrics, perDay]) => {
    metrics.days = eachDay(perDay, days)
    res.json(metrics)
  }).catch(err => {
    next(err)
  })
})

module.exports = router
