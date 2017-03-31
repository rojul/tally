const { expect } = require('chai')
const supertest = require('supertest-as-promised')

const testUtils = require('../test-utils')
const app = require('../app')

const request = supertest(app)

describe('transactions', function () {
  describe('delete transaction', function () {
    it('success', async function () {
      let userId = await testUtils.createUser('delete transaction')
      let transactionRes = await request.post('/api/users/' + userId + '/transactions')
        .send({ value: 300 })
      let res = await request.delete('/api/transactions/' + transactionRes.body.transactionId)
      expect(res.statusCode).to.equal(200)
      // res = await testUtils.getTransaction(transactionId) // TODO maybe it should return 404
      // expect(res.statusCode).to.equal(404)
    })
    it('invalid transactionId', async function () {
      let res = await request.delete('/api/transactions/noint')
      expect(res.statusCode).to.equal(400)
    })
    it('transaction doesnt exist', async function () {
      let res = await request.delete('/api/transactions/99999')
      expect(res.statusCode).to.equal(404)
      expect(res.body.error).to.equal('transaction not found')
    })
  })
})
