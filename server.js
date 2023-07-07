const fastify = require('fastify')({
    logger: true
})
const fs = require('fs')
const path = require('path')
require('dotenv').config()

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'pages'),
})



fastify.get('/', function (request, reply) {
    reply.send({hello: 'world'})
})

fastify.get('/world', function (req, rep) {
    rep.send(require('./world.json'))
})

fastify.get('/tictactoe', function (req, rep) {
    rep.sendFile('/tictactoe/index.html')
})

fastify.listen({port: 80, host: '0.0.0.0'}, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})