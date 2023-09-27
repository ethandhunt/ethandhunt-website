const fastify = require('fastify')({
    logger: {
        level: "info"
    }
})
const fs = require('fs')
const path = require('path')
require('dotenv').config()

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'pages'),
})

fastify.register(require('@fastify/websocket'), {
    
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

clients = []
fastify.register(async function (fastify) {
    fastify.get('/wstest', {websocket: true}, (connection, req) => {
        var socket = connection.socket
        
        setInterval(() => {
            socket.send(JSON.stringify(clients))
        }, 1000)

        socket.send('a')
    })
})

// router forwards port 80 to this machine on port 3000
fastify.listen({port: 3000, host: '0.0.0.0'}, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})