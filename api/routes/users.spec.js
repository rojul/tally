const { expect } = require('chai')
const supertest = require('supertest-as-promised')

const testUtils = require('../test-utils')
const app = require('../app')

const request = supertest(app)

describe('users', function () {
  describe('get all users', function () {
    it('success', async function () {
      let userId = await testUtils.createUser('get all users')
      let res = await request.get('/api/users')
      expect(res.statusCode).to.equal(200)
      let user = res.body.users.find(user => user.id === userId)
      expect(user.id).to.equal(userId)
      expect(user.name).to.equal('get all users')
      expect(user.active).to.be.a('number')
      expect(user.balance).to.equal(0)
    })
  })
  describe('get user', function () {
    it('success', async function () {
      let userId = await testUtils.createUser('get user')
      let res = await request.get('/api/users/' + userId)
      expect(res.statusCode).to.equal(200)
      expect(res.body.id).to.equal(userId)
      expect(res.body.name).to.equal('get user')
      expect(res.body.created).to.be.a('number')
      expect(res.body.balance).to.equal(0)
      expect(res.body.active).to.be.a('number')
      expect(res.body.transactions).to.deep.equal([])
    })
    it('success', async function () {
      let userId = await testUtils.createUser('get user 2', 122)
      let res = await request.get('/api/users/' + userId)
      expect(res.statusCode).to.equal(200)
      let transaction = res.body.transactions[0]
      expect(transaction.id).to.be.a('number')
      expect(transaction.value).to.equal(122)
      expect(transaction.created).to.be.a('number')
    })
    it('invalid userId', async function () {
      let res = await request.get('/api/users/noint')
      expect(res.statusCode).to.equal(400)
    })
    it('user doesnt exist', async function () {
      let res = await request.get('/api/users/99999')
      expect(res.statusCode).to.equal(404)
      expect(res.body.error).to.equal('user not found')
    })
  })
  describe('create user', function () {
    it('success', async function () {
      let startTime = Date.now()
      let res = await request.post('/api/users')
        .send({ name: 'create user' })
      expect(res.statusCode).to.equal(200)
      let userId = res.body.userId
      expect(userId).to.be.a('number')
      res = await testUtils.getUser(userId)
      expect(res.statusCode).to.equal(200)
      expect(res.body.name).to.equal('create user')
      expect(res.body.active).to.equal(res.body.created)
      expect(res.body.created).to.be.least(startTime / 1000 - 1)
      expect(res.body.created).to.be.at.most(Date.now() / 1000 + 1)
    })
    it('duplicate name', async function () {
      let res = await request.post('/api/users')
        .send({ name: 'create user duplicate' })
      expect(res.statusCode).to.equal(200)
      res = await request.post('/api/users')
        .send({
          name: 'create user duplicate'
        })
      expect(res.statusCode).to.equal(409)
      expect(res.body.error).to.equal('duplicate name')
    })
    it('no name', async function () {
      let res = await request.post('/api/users').send({})
      expect(res.statusCode).to.equal(400)
      expect(res.body.errors.length).to.equal(1)
      expect(res.body.errors[0].param).to.equal('name')
    })
    it('minlenght', async function () {
      let res = await request.post('/api/users')
        .send({ name: '' })
      expect(res.statusCode).to.equal(400)
      expect(res.body.errors.length).to.equal(1)
      expect(res.body.errors[0].param).to.equal('name')
    })
    it('maxlenght', async function () {
      let res = await request.post('/api/users')
        .send({ name: 'a'.repeat(31) })
      expect(res.statusCode).to.equal(400)
      expect(res.body.errors.length).to.equal(1)
      expect(res.body.errors[0].param).to.equal('name')
    })
  })
  describe('update user', function () {
    it('success', async function () {
      let userId = await testUtils.createUser('update user')
      let res = await request.put('/api/users/' + userId)
        .send({ name: 'update user 2' })
      expect(res.statusCode).to.equal(200)
      res = await testUtils.getUser(userId)
      expect(res.body.name).to.equal('update user 2')
    })
    it('duplicate name', async function () {
      let res = await request.post('/api/users')
        .send({ name: 'update user duplicate' })
      expect(res.statusCode).to.equal(200)
      res = await request.post('/api/users')
        .send({ name: 'update user duplicate' })
      expect(res.statusCode).to.equal(409)
      expect(res.body.error).to.equal('duplicate name')
    })
    it('invalid userId', async function () {
      let res = await request.put('/api/users/noint')
      expect(res.statusCode).to.equal(400)
    })
    it('user doesnt exist', async function () {
      let res = await request.put('/api/users/99999')
        .send({ name: 'JoshMatz2' })
      expect(res.statusCode).to.equal(404)
      expect(res.body.error).to.equal('user not found')
    })
    it('no name', async function () {
      let res = await request.put('/api/users/99999')
        .send({})
      expect(res.statusCode).to.equal(400)
      expect(res.body.errors.length).to.equal(1)
      expect(res.body.errors[0].param).to.equal('name')
    })
    it('minlenght', async function () {
      let res = await request.put('/api/users/99999')
        .send({ name: '' })
      expect(res.statusCode).to.equal(400)
      expect(res.body.errors.length).to.equal(1)
      expect(res.body.errors[0].param).to.equal('name')
    })
    it('maxlenght', async function () {
      let res = await request.put('/api/users/99999')
        .send({ name: 'a'.repeat(31) })
      expect(res.statusCode).to.equal(400)
      expect(res.body.errors.length).to.equal(1)
      expect(res.body.errors[0].param).to.equal('name')
    })
  })
  describe('delete user', function () {
    it('success', async function () {
      let userId = await testUtils.createUser('delete user')
      let res = await request.delete('/api/users/' + userId)
      expect(res.statusCode).to.equal(200)
      res = await testUtils.getUser(userId)
      expect(res.statusCode).to.equal(404)
    })
    it('invalid userId', async function () {
      let res = await request.delete('/api/users/noint')
      expect(res.statusCode).to.equal(400)
    })
    it('user doesnt exist', async function () {
      let res = await request.delete('/api/users/99999')
      expect(res.statusCode).to.equal(404)
      expect(res.body.error).to.equal('user not found')
    })
  })
})
