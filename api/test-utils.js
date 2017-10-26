const supertest = require('supertest')

const app = require('./app')
const db = require('./db')

const request = supertest(app)

exports.createUser = async(name, value) => {
  let res = await request.post('/api/users')
    .send({ name })
    .expect(200)
  let userId = res.body.userId
  if (value) {
    await request.post('/api/users/' + userId + '/transactions')
      .send({ value })
      .expect(200)
  }
  return userId
}

exports.getUser = userId => {
  return request.get('/api/users/' + userId)
}

exports.clearDB = userId => {
  return Promise.all([
    db.query('DELETE FROM user'),
    db.query('DELETE FROM product'),
    db.query('DELETE FROM config')
  ])
}
