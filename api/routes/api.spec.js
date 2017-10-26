const { expect } = require('chai')
const supertest = require('supertest')

const testUtils = require('../test-utils')
const app = require('../app')

const request = supertest(app)

describe('api', function () {
  before(function () {
    testUtils.clearDB()
  })
  it('name', async function () {
    let res = await request.get('/api')
    expect(res.statusCode).to.equal(200)
  })
  it('version', async function () {
    let res = await request.get('/api/version')
    expect(res.statusCode).to.equal(200)
    expect(res.body.version).to.be.a('string')
  })
  it('invalid route', async function () {
    let res = await request.get('/api/404')
    expect(res.statusCode).to.equal(404)
    expect(res.body.error).to.equal('Resource Not Found')
  })
})
