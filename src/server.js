const fs = require('fs')
const ON_DEATH = require('death')({uncaughtException: true})
const os = require('os')
const prod = os.hostname() == 'agilesimulations' ? true : false
const logFile = prod ? process.argv[4] : 'server.log'

ON_DEATH(function(signal, err) {
  let logStr = new Date()
  if (signal) {
    logStr = logStr + ' ' + signal + '\n'
  }
  if (err && err.stack) {
    logStr = logStr + '  Error: ' + err.stack + '\n'
  }
  fs.appendFile(logFile, logStr, function (err) {
    if (err) console.log(logStr)
    process.exit()
  })
})

let httpServer
let io
if (!prod) {
  const express = require('express')
  const app = express()
  httpServer = require('http').createServer(app)
  io = require('socket.io')(httpServer, {
    cors: {
      origins: ['http://localhost:*'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  })
} else {
  const options = {
    key: fs.readFileSync('/etc/ssl/private/agilesimulations.co.uk.key'),
    cert: fs.readFileSync('/etc/ssl/certs/07DDA10F5A5AB75BD9E9508BC490D32C.cer')
  }
  httpServer = require('https').createServer(options)
  io = require('socket.io')(httpServer, {
    cors: {
      origins: ['https://agilesimulations.co.uk'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  })
}

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

MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
  if (err) throw err
  const db = client.db('db')

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

    // Test

    socket.on('loadTestOrganisationStudents', (data) => { dbStore.loadTestOrganisationStudents(db, io, data, debugOn) })

    socket.on('loadStudentTestInstances', (data) => { dbStore.loadStudentTestInstances(db, io, data, debugOn) })

    socket.on('createTestInstance', (data) => { dbStore.createTestInstance(db, io, data, debugOn) })

    socket.on('loadTestInstance', (data) => { dbStore.loadTestInstance(db, io, data, debugOn) })

    socket.on('setAnswer', (data) => { dbStore.setAnswer(db, io, data, debugOn) })

    // Results

    socket.on('loadTestInstances', () => { dbStore.loadTestInstances(db, io, debugOn) })

    socket.on('deleteTestInstance', (data) => { dbStore.deleteTestInstance(db, io, data, debugOn) })

    // Facilitator

    socket.on('loadOrganisations', () => { dbStore.loadOrganisations(db, io, debugOn) })

    socket.on('loadStudents', (data) => { dbStore.loadStudents(db, io, data, debugOn) })

    socket.on('loadTests', () => { dbStore.loadTests(db, io, debugOn) })

    socket.on('loadSections', (data) => { dbStore.loadSections(db, io, data, debugOn) })

    socket.on('loadQuestions', (data) => { dbStore.loadQuestions(db, io, data, debugOn) })

    socket.on('addOrganisation', (data) => { dbStore.addOrganisation(db, io, data, debugOn) })

    socket.on('updateOrganisation', (data) => { dbStore.updateOrganisation(db, io, data, debugOn) })

    socket.on('setOrganisationTest', (data) => { dbStore.setOrganisationTest(db, io, data, debugOn) })

    socket.on('deleteOrganisation', (data) => { dbStore.deleteOrganisation(db, io, data, debugOn) })

    socket.on('addStudent', (data) => { dbStore.addStudent(db, io, data, debugOn) })

    socket.on('updateStudent', (data) => { dbStore.updateStudent(db, io, data, debugOn) })

    socket.on('deleteStudent', (data) => { dbStore.deleteStudent(db, io, data, debugOn) })

    socket.on('addTest', (data) => { dbStore.addTest(db, io, data, debugOn) })

    socket.on('updateTest', (data) => { dbStore.updateTest(db, io, data, debugOn) })

    socket.on('deleteTest', (data) => { dbStore.deleteTest(db, io, data, debugOn) })

    socket.on('addSection', (data) => { dbStore.addSection(db, io, data, debugOn) })

    socket.on('updateSection', (data) => { dbStore.updateSection(db, io, data, debugOn) })

    socket.on('updateSectionQuestionsToShow', (data) => { dbStore.updateSectionQuestionsToShow(db, io, data, debugOn) })

    socket.on('deleteSection', (data) => { dbStore.deleteSection(db, io, data, debugOn) })

    socket.on('moveSectionUp', (data) => { dbStore.moveSectionUp(db, io, data, debugOn) })

    socket.on('moveSectionDown', (data) => { dbStore.moveSectionDown(db, io, data, debugOn) })

    socket.on('addQuestion', (data) => { dbStore.addQuestion(db, io, data, debugOn) })

    socket.on('deleteQuestion', (data) => { dbStore.deleteQuestion(db, io, data, debugOn) })

    socket.on('moveQuestionUp', (data) => { dbStore.moveQuestionUp(db, io, data, debugOn) })

    socket.on('moveQuestionDown', (data) => { dbStore.moveQuestionDown(db, io, data, debugOn) })

    socket.on('addAnswer', (data) => { dbStore.addAnswer(db, io, data, debugOn) })

    socket.on('saveAnswer', (data) => { dbStore.addAnswer(db, io, data, debugOn) })

    socket.on('makeAnswer', (data) => { dbStore.makeAnswer(db, io, data, debugOn) })

    socket.on('makeTrueFalseAnswer', (data) => { dbStore.makeTrueFalseAnswer(db, io, data, debugOn) })

    socket.on('deleteAnswer', (data) => { dbStore.deleteAnswer(db, io, data, debugOn) })

    socket.on('moveAnswerUp', (data) => { dbStore.moveAnswerUp(db, io, data, debugOn) })

    socket.on('moveAnswerDown', (data) => { dbStore.moveAnswerDown(db, io, data, debugOn) })

    socket.on('saveQuestionType', (data) => { dbStore.saveQuestionType(db, io, data, debugOn) })

    socket.on('saveQuestionQuestion', (data) => { dbStore.saveQuestionQuestion(db, io, data, debugOn) })
  })
})

const port = process.argv[2] || 3015

httpServer.listen(port, () => {
  console.log('Listening on *:' + port)
})
