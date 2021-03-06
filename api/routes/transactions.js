const express = require('express')

const db = require('../db')

let router = express.Router({ mergeParams: true })

router.delete('/:transactionId', (req, res, next) => {
  req.checkParams('transactionId', 'Invalid transactionId').notEmpty().isInt()

  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }

  db.query('DELETE FROM transaction WHERE id = ?', [req.params.transactionId]).then(rows => {
    if (rows.affectedRows === 1) {
      res.json({})
    } else { res.status(404).json({ error: 'transaction not found' }) }
  }).catch(err => {
    next(err)
  })
})

module.exports = router
