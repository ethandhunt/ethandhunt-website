const fastify = require('fastify')({
    logger: {
        level: "info",
        file: "logs.txt"
    }
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

// router forwards port 80 to this machine on port 3000
fastify.listen({port: 3000, host: '0.0.0.0'}, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})