const express = require('express')

const config = require('../config')
const db = require('../db')

let router = express.Router()

router.get('/', (req, res, next) => {
  db.query('SELECT id, name, price FROM product').then(products => {
    res.json({ products })
  }).catch(err => {
    next(err)
  })
})

const validateProductSchema = {
  name: {
    isLength: {
      options: [{ min: 1 }]
    }
  },
  price: {
    isInt: {
      options: [{ min: 1, max: config.transactionMaxValue }]
    }
  }
}

router.post('/', (req, res, next) => {
  req.sanitizeBody('name').toName()
  req.checkBody(validateProductSchema)

  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }

  let product = {
    name: req.body.name,
    price: req.body.price
  }
  db.query('INSERT INTO product SET ?', [product]).then(rows => {
    res.json({
      productId: rows.insertId
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

router.put('/:productId', (req, res, next) => {
  req.checkParams('productId', 'Invalid productId').notEmpty().isInt()
  req.sanitizeBody('name').toName()
  req.checkBody(validateProductSchema)

  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }

  let product = {
    name: req.body.name,
    price: req.body.price
  }
  db.query('UPDATE product SET ? WHERE ?', [product, { id: req.params.productId }]).then(rows => {
    if (rows.affectedRows === 1) {
      res.json({})
    } else {
      res.status(404).json({ error: 'product not found' })
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

router.delete('/:productId', (req, res, next) => {
  req.checkParams('productId', 'Invalid productId').notEmpty().isInt()

  let errors = req.validationErrors()
  if (errors) {
    return res.status(400).json({ errors })
  }

  db.query('DELETE FROM product WHERE ?', { id: req.params.productId }).then(rows => {
    if (rows.affectedRows === 1) {
      res.json({})
    } else {
      res.status(404).json({ error: 'product not found' })
    }
  }).catch(err => {
    next(err)
  })
})

module.exports = router
