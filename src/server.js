const fs = require('fs')
const ON_DEATH = require('death')({uncaughtException: true})
const os = require('os')
const prod = os.hostname() == 'agilesimulations' ? true : false
const logFile = prod ? process.argv[4] : 'server.log'

let currentAction = ''
let currentData = ''
ON_DEATH(function(signal, err) {
  let logStr = new Date()
  if (signal) {
    logStr = logStr + ' ' + signal + '\n'
  }
  if (currentAction) {
    logStr = logStr + '  Action: ' + currentAction + '\n'
  }
  if (currentData) {
    logStr = logStr + '  Data: ' + currentData + '\n'
  }
  if (err && err.stack) {
    logStr = logStr + '  Error: ' + err.stack + '\n'
  }
  fs.appendFile(logFile, logStr, function (err) {
    if (err) console.log(logStr)
    process.exit()
  })
})

const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const dbStore = require('./store/dbStore.js')

const MongoClient = require('mongodb').MongoClient

const url = prod ?  'mongodb://127.0.0.1:27017/' : 'mongodb://localhost:27017/'

const connectDebugOff = prod
const debugOn = !prod

let connections = 0
const maxConnections = 2500

function emit(event, data) {
  if (debugOn) {
    console.log(event, data)
  }
  io.emit(event, data)
}

function doDb(fun, data) {
  currentAction = fun
  currentData = data
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
    if (err) throw err
    const db = client.db('db')

    switch(fun) {
      case 'loadTests':
        dbStore.loadTests(db, io, debugOn)
        break
      case 'loadSections':
        dbStore.loadSections(db, io, data, debugOn)
        break
      case 'loadQuestions':
        dbStore.loadQuestions(db, io, data, debugOn)
        break

      case 'addTest':
        dbStore.addTest(db, io, data, debugOn)
        break
      case 'addSection':
        dbStore.addSection(db, io, data, debugOn)
        break
      case 'addQuestion':
        dbStore.addQuestion(db, io, data, debugOn)
        break
      case 'addAnswer':
        dbStore.addAnswer(db, io, data, debugOn)
        break
      case 'makeAnswer':
        dbStore.makeAnswer(db, io, data, debugOn)
        break
      case 'saveQuestionType':
        dbStore.saveQuestionType(db, io, data, debugOn)
        break
      case 'saveQuestionQuestion':
        dbStore.saveQuestionQuestion(db, io, data, debugOn)
        break
    }
  })
}
io.on('connection', (socket) => {
  connections = connections + 1
  if (connections > maxConnections) {
    console.log(`Too many connections. Socket ${socket.id} closed`)
    socket.disconnect(0)
  } else {
    connectDebugOff || console.log(`A user connected with socket id ${socket.id}. (${connections} connections)`)
    emit('updateConnections', {connections: connections, maxConnections: maxConnections})
  }

  socket.on('disconnect', () => {
    connections = connections - 1
    connectDebugOff || console.log(`User with socket id ${socket.id} has disconnected. (${connections} connections)`)
    emit('updateConnections', {connections: connections, maxConnections: maxConnections})
  })

  socket.on('loadTests', () => { doDb('loadTests') })

  socket.on('loadSections', (data) => { doDb('loadSections', data) })

  socket.on('loadQuestions', (data) => { doDb('loadQuestions', data) })

  socket.on('addTest', (data) => { doDb('addTest', data) })

  socket.on('addSection', (data) => { doDb('addSection', data) })

  socket.on('addQuestion', (data) => { doDb('addQuestion', data) })

  socket.on('addAnswer', (data) => { doDb('addAnswer', data) })

  socket.on('makeAnswer', (data) => { doDb('makeAnswer', data) })

  socket.on('saveQuestionType', (data) => { doDb('saveQuestionType', data) })

  socket.on('saveQuestionQuestion', (data) => { doDb('saveQuestionQuestion', data) })

})

const port = process.argv[2] || 3015

http.listen(port, () => {
  console.log('Listening on *:' + port)
})
