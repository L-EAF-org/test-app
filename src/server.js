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

function doDb(fun, data) {
  currentAction = fun
  currentData = data
  MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
    if (err) throw err
    const db = client.db('db')

    switch(fun) {
      case 'loadTestOrganisationStudents':
        dbStore.loadTestOrganisationStudents(db, io, data, debugOn)
        break
      case 'loadStudentTestInstances':
        dbStore.loadStudentTestInstances(db, io, data, debugOn)
        break
      case 'createTestInstance':
        dbStore.createTestInstance(db, io, data, debugOn)
        break
      case 'loadTestInstance':
        dbStore.loadTestInstance(db, io, data, debugOn)
        break
      case 'setAnswer':
        dbStore.setAnswer(db, io, data, debugOn)
        break

      case 'loadTestInstances':
        dbStore.loadTestInstances(db, io, debugOn)
        break
      case 'deleteTestInstance':
        dbStore.deleteTestInstance(db, io, data, debugOn)
        break

      case 'loadOrganisations':
        dbStore.loadOrganisations(db, io, debugOn)
        break
      case 'loadStudents':
        dbStore.loadStudents(db, io, data, debugOn)
        break
      case 'loadTests':
        dbStore.loadTests(db, io, debugOn)
        break
      case 'loadSections':
        dbStore.loadSections(db, io, data, debugOn)
        break
      case 'loadQuestions':
        dbStore.loadQuestions(db, io, data, debugOn)
        break

      case 'addOrganisation':
        dbStore.addOrganisation(db, io, data, debugOn)
        break
      case 'updateOrganisation':
        dbStore.updateOrganisation(db, io, data, debugOn)
        break
      case 'setOrganisationTest':
        dbStore.setOrganisationTest(db, io, data, debugOn)
        break
      case 'deleteOrganisation':
        dbStore.deleteOrganisation(db, io, data, debugOn)
        break
      case 'addStudent':
        dbStore.addStudent(db, io, data, debugOn)
        break
      case 'updateStudent':
        dbStore.updateStudent(db, io, data, debugOn)
        break
      case 'deleteStudent':
        dbStore.deleteStudent(db, io, data, debugOn)
        break
      case 'addTest':
        dbStore.addTest(db, io, data, debugOn)
        break
      case 'updateTest':
        dbStore.updateTest(db, io, data, debugOn)
        break
      case 'deleteTest':
        dbStore.deleteTest(db, io, data, debugOn)
        break
      case 'addSection':
        dbStore.addSection(db, io, data, debugOn)
        break
      case 'updateSection':
        dbStore.updateSection(db, io, data, debugOn)
        break
      case 'updateSectionQuestionsToShow':
        dbStore.updateSectionQuestionsToShow(db, io, data, debugOn)
        break
      case 'deleteSection':
        dbStore.deleteSection(db, io, data, debugOn)
        break
      case 'moveSectionUp':
        dbStore.moveSectionUp(db, io, data, debugOn)
        break
      case 'moveSectionDown':
        dbStore.moveSectionDown(db, io, data, debugOn)
        break
      case 'addQuestion':
        dbStore.addQuestion(db, io, data, debugOn)
        break
      case 'deleteQuestion':
        dbStore.deleteQuestion(db, io, data, debugOn)
        break
      case 'moveQuestionUp':
        dbStore.moveQuestionUp(db, io, data, debugOn)
        break
      case 'moveQuestionDown':
        dbStore.moveQuestionDown(db, io, data, debugOn)
        break
      case 'addAnswer':
        dbStore.addAnswer(db, io, data, debugOn)
        break
      case 'saveAnswer':
        dbStore.saveAnswer(db, io, data, debugOn)
        break
      case 'makeAnswer':
        dbStore.makeAnswer(db, io, data, debugOn)
        break
      case 'makeTrueFalseAnswer':
        dbStore.makeTrueFalseAnswer(db, io, data, debugOn)
        break
      case 'deleteAnswer':
        dbStore.deleteAnswer(db, io, data, debugOn)
        break
      case 'moveAnswerUp':
        dbStore.moveAnswerUp(db, io, data, debugOn)
        break
      case 'moveAnswerDown':
        dbStore.moveAnswerDown(db, io, data, debugOn)
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

  // Test

  socket.on('loadTestOrganisationStudents', (data) => { doDb('loadTestOrganisationStudents', data) })

  socket.on('loadStudentTestInstances', (data) => { doDb('loadStudentTestInstances', data) })

  //socket.on('loadTest', (data) => { doDb('loadTest', data) })

  socket.on('createTestInstance', (data) => { doDb('createTestInstance', data) })

  socket.on('loadTestInstance', (data) => { doDb('loadTestInstance', data) })

  socket.on('setAnswer', (data) => { doDb('setAnswer', data) })

  // Results

  socket.on('loadTestInstances', () => { doDb('loadTestInstances') })

  socket.on('deleteTestInstance', (data) => { doDb('deleteTestInstance', data) })

  // Facilitator

  socket.on('loadOrganisations', () => { doDb('loadOrganisations') })

  socket.on('loadStudents', (data) => { doDb('loadStudents', data) })

  socket.on('loadTests', () => { doDb('loadTests') })

  socket.on('loadSections', (data) => { doDb('loadSections', data) })

  socket.on('loadQuestions', (data) => { doDb('loadQuestions', data) })

  socket.on('addOrganisation', (data) => { doDb('addOrganisation', data) })

  socket.on('updateOrganisation', (data) => { doDb('updateOrganisation', data) })

  socket.on('setOrganisationTest', (data) => { doDb('setOrganisationTest', data) })

  socket.on('deleteOrganisation', (data) => { doDb('deleteOrganisation', data) })

  socket.on('addStudent', (data) => { doDb('addStudent', data) })

  socket.on('updateStudent', (data) => { doDb('updateStudent', data) })

  socket.on('deleteStudent', (data) => { doDb('deleteStudent', data) })

  socket.on('addTest', (data) => { doDb('addTest', data) })

  socket.on('updateTest', (data) => { doDb('updateTest', data) })

  socket.on('deleteTest', (data) => { doDb('deleteTest', data) })

  socket.on('addSection', (data) => { doDb('addSection', data) })

  socket.on('updateSection', (data) => { doDb('updateSection', data) })

  socket.on('updateSectionQuestionsToShow', (data) => { doDb('updateSectionQuestionsToShow', data) })

  socket.on('deleteSection', (data) => { doDb('deleteSection', data) })

  socket.on('moveSectionUp', (data) => { doDb('moveSectionUp', data) })

  socket.on('moveSectionDown', (data) => { doDb('moveSectionDown', data) })

  socket.on('addQuestion', (data) => { doDb('addQuestion', data) })

  socket.on('deleteQuestion', (data) => { doDb('deleteQuestion', data) })

  socket.on('moveQuestionUp', (data) => { doDb('moveQuestionUp', data) })

  socket.on('moveQuestionDown', (data) => { doDb('moveQuestionDown', data) })

  socket.on('addAnswer', (data) => { doDb('addAnswer', data) })

  socket.on('saveAnswer', (data) => { doDb('saveAnswer', data) })

  socket.on('makeAnswer', (data) => { doDb('makeAnswer', data) })

  socket.on('makeTrueFalseAnswer', (data) => { doDb('makeTrueFalseAnswer', data) })

  socket.on('deleteAnswer', (data) => { doDb('deleteAnswer', data) })

  socket.on('moveAnswerUp', (data) => { doDb('moveAnswerUp', data) })

  socket.on('moveAnswerDown', (data) => { doDb('moveAnswerDown', data) })

  socket.on('saveQuestionType', (data) => { doDb('saveQuestionType', data) })

  socket.on('saveQuestionQuestion', (data) => { doDb('saveQuestionQuestion', data) })

})

const port = process.argv[2] || 3015

httpServer.listen(port, () => {
  console.log('Listening on *:' + port)
})
