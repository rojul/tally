const { expect } = require('chai')
const supertest = require('supertest')

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
  describe('put title', function () {
    it('success', async function () {
      let res = await request.put('/api/config/title')
        .send({ value: 'New title' })
      expect(res.statusCode).to.equal(200)
      expect(res.body).to.deep.equal({})

      res = await request.get('/api/config')
      expect(res.statusCode).to.equal(200)
      expect(res.body.title).to.equal('New title')
    })
    it('empty', async function () {
      let res = await request.put('/api/config/title')
        .send({ value: '' })
      expect(res.statusCode).to.equal(400)
    })
    it('no value', async function () {
      let res = await request.put('/api/config/title')
        .send({})
      expect(res.statusCode).to.equal(400)
    })
  })
  describe('remove title', function () {
    it('success', async function () {
      let res = await request.delete('/api/config/title')
      expect(res.statusCode).to.equal(200)
      expect(res.body).to.deep.equal({})

      res = await request.get('/api/config')
      expect(res.statusCode).to.equal(200)
      expect(res.body.title).to.equal('Tally')
    })
  })
  describe('put funChanceToWin', function () {
    it('success', async function () {
      let res = await request.put('/api/config/funChanceToWin')
        .send({ value: 20 })
      expect(res.statusCode).to.equal(200)
      expect(res.body).to.deep.equal({})

      res = await request.get('/api/config')
      expect(res.statusCode).to.equal(200)
      expect(res.body.funChanceToWin).to.equal(20)
    })
    it('invalid int', async function () {
      let res = await request.put('/api/config/funChanceToWin')
        .send({ value: 'A' })
      expect(res.statusCode).to.equal(400)
    })
    it('negative int', async function () {
      let res = await request.put('/api/config/funChanceToWin')
        .send({ value: -1 })
      expect(res.statusCode).to.equal(400)
    })
  })
})
