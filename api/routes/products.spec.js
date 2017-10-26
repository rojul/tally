const { expect } = require('chai')
const supertest = require('supertest')

const testUtils = require('../test-utils')
const app = require('../app')

const request = supertest(app)

describe('products', function () {
  before(function () {
    testUtils.clearDB()
  })
  describe('get all products', function () {
    it('success', async function () {
      let res = await request.get('/api/products')
      expect(res.statusCode).to.equal(200)
      expect(res.body.products).to.deep.equal([])
    })
  })
  describe('create products', function () {
    it('success', async function () {
      let res = await request.post('/api/products')
        .send({ name: 'create product success', price: 100 })
      expect(res.statusCode).to.equal(200)
      expect(res.body.productId).to.be.a('number')
    })
    it('success with fun', async function () {
      let res = await request.post('/api/products')
        .send({ name: 'create product with fun success', price: 100, fun: true })
      expect(res.statusCode).to.equal(200)
      expect(res.body.productId).to.be.a('number')
    })
    it('no price', async function () {
      let res = await request.post('/api/products')
        .send({ name: 'create product no price' })
      expect(res.statusCode).to.equal(400)
    })
    it('no name', async function () {
      let res = await request.post('/api/products')
        .send({ price: 100 })
      expect(res.statusCode).to.equal(400)
    })
    it('price not an int', async function () {
      let res = await request.post('/api/products')
        .send({ name: 'create product price not an int', price: 100.1 })
      expect(res.statusCode).to.equal(400)
    })
    it('price to small', async function () {
      let res = await request.post('/api/products')
        .send({ name: 'create product price to small', price: 0 })
      expect(res.statusCode).to.equal(400)
      res = await request.post('/api/products')
        .send({ name: 'create product price to small2', price: -1 })
      expect(res.statusCode).to.equal(400)
    })
    it('invalid fun', async function () {
      let res = await request.post('/api/products')
        .send({ name: 'create product with invalid fun', price: 100, fun: 'true' })
      expect(res.statusCode).to.equal(400)
    })
  })
})
