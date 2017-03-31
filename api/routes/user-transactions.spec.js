const { expect } = require('chai')
const supertest = require('supertest-as-promised')

const testUtils = require('../test-utils')
const app = require('../app')

const request = supertest(app)

describe('transactions', function () {
  describe('get transactions for one user', function () {
    it('success', async function () { // TODO maybe 404
      let res = await request.get('/api/users/99999/transactions')
      expect(res.statusCode).to.equal(200)
      expect(res.body.transactions).to.deep.equal([])
      expect(res.body.balance).to.equal(0)
    })
    it('invalid userId', async function () {
      let res = await request.get('/api/users/noint/transactions')
      expect(res.statusCode).to.equal(400)
      expect(res.body.errors.length).to.equal(1)
      expect(res.body.errors[0].param).to.equal('userId')
      expect(res.body.errors[0].msg).to.equal('Invalid userId')
    })
  })
  describe('create transaction', function () {
    it('success', async function () {
      let userId = await testUtils.createUser('create transaction')
      let res = await request.post('/api/users/' + userId + '/transactions')
        .send({ value: 300 })
      expect(res.statusCode).to.equal(200)
      expect(res.body.transactionId).to.be.a('number')
    })
    it('invalid userId', async function () {
      let res = await request.post('/api/users/noint/transactions')
        .send({ value: 300 })
      expect(res.statusCode).to.equal(400)
      expect(res.body.errors.length).to.equal(1)
      expect(res.body.errors[0].param).to.equal('userId')
      expect(res.body.errors[0].msg).to.equal('Invalid userId')
    })
    it('no value', async function () {
      let res = await request.post('/api/users/99999/transactions')
        .send({})
      expect(res.statusCode).to.equal(400)
      expect(res.body.errors.length).to.equal(1)
      expect(res.body.errors[0].param).to.equal('value')
      expect(res.body.errors[0].msg).to.equal('Invalid param')
    })
    it('user doesnt exist', async function () {
      let res = await request.post('/api/users/99999/transactions')
        .send({ value: 300 })
      expect(res.statusCode).to.equal(404)
      expect(res.body.error).to.equal('user not found')
    })
  })
})
