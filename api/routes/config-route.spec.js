const { expect } = require('chai')
const supertest = require('supertest-as-promised')

const testUtils = require('../test-utils')
const app = require('../app')

const request = supertest(app)

describe('config', function () {
  before(function () {
    testUtils.clearDB()
  })
  describe('get config', function () {
    it('success', async function () {
      let res = await request.get('/api/config')
      expect(res.statusCode).to.equal(200)
      expect(res.body).to.be.a('object')
      expect(res.body.recharge).to.deep.equal([])
    })
  })
  describe('put recharge config', function () {
    it('success', async function () {
      let res = await request.put('/api/config/recharge').send({
        value: [50, 20, 10, 20]
      })
      expect(res.statusCode).to.equal(200)
      expect(res.body).to.deep.equal({})
    })
    it('no value', async function () {
      let res = await request.put('/api/config/recharge')
        .send({})
      expect(res.statusCode).to.equal(400)
      expect(res.body).to.deep.equal({
        errors: [{
          msg: 'Invalid value',
          param: 'value'
        }]
      })
    })
    it('not an int', async function () {
      let res = await request.put('/api/config/recharge').send({
        value: [50, 20.5, 10]
      })
      expect(res.statusCode).to.equal(400)
      expect(res.body).to.deep.equal({
        errors: [{
          msg: 'Invalid value',
          param: 'value',
          value: [50, 20.5, 10]
        }]
      })
    })
    it('smaller than 1', async function () {
      let res = await request.put('/api/config/recharge').send({
        value: [50, 0, 10]
      })
      expect(res.statusCode).to.equal(400)
      expect(res.body).to.deep.equal({
        errors: [{
          msg: 'Invalid value',
          param: 'value',
          value: [50, 0, 10]
        }]
      })
    })
  })
})
