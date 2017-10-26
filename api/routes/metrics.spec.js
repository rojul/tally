const { expect } = require('chai')
const supertest = require('supertest')

const testUtils = require('../test-utils')
const app = require('../app')

const request = supertest(app)

describe('metrics', function () {
  before(function () {
    testUtils.clearDB()
  })
  describe('get metrics', function () {
    it('success - default 30 days', async function () {
      await testUtils.createUser('get metrics', 300)
      await testUtils.createUser('get metrics 2', 200)
      let res = await request.get('/api/metrics')
      expect(res.statusCode).to.equal(200)
      expect(res.body.transactions).to.equal(2)
      expect(res.body.users).to.equal(2)
      expect(res.body.balance).to.equal(500)
      expect(res.body.days.length).to.equal(30)
      let day1 = res.body.days[0]
      let day30 = res.body.days[29]
      let now = new Date()
      expect(day1).to.deep.equal({
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() / 1000,
        transactions: 2,
        activeUsers: 2,
        chargeBalance: 500,
        payBalance: 0
      })
      expect(day30).to.deep.equal({
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0).getTime() / 1000,
        transactions: 0,
        activeUsers: 0,
        chargeBalance: 0,
        payBalance: 0
      })
    })
    it('success - 20 days', async function () {
      let res = await request.get('/api/metrics?days=20')
      expect(res.statusCode).to.equal(200)
      expect(res.body.days.length).to.equal(20)
    })
    it('days is 0', async function () {
      let res = await request.get('/api/metrics?days=0')
      expect(res.statusCode).to.equal(400)
    })
    it('days is negative', async function () {
      let res = await request.get('/api/metrics?days=-1')
      expect(res.statusCode).to.equal(400)
    })
    it('days not an int', async function () {
      let res = await request.get('/api/metrics?days=a')
      expect(res.statusCode).to.equal(400)
      res = await request.get('/api/metrics?days=1.1')
      expect(res.statusCode).to.equal(400)
    })
  })
})
