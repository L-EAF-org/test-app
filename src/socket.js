import io from 'socket.io-client'
import bus from './EventBus'

let connStr
if (location.hostname == 'localhost') {
  connStr = 'http://localhost:3015'
} else {
  connStr = 'https://agilesimulations.co.uk:3015'
}
console.log('Connecting to: ' + connStr)
const socket = io(connStr)

// --- Send ---

bus.$on('sendLoadOrganisations', (data) => { socket.emit('sendLoadOrganisations', data) })

bus.$on('sendLoadTests', (data) => { socket.emit('sendLoadTests', data) })

bus.$on('sendLoadTestInstances', (data) => { socket.emit('sendLoadTestInstances', data) })

bus.$on('sendDeleteTestInstance', (data) => { socket.emit('sendDeleteTestInstance', data) })

bus.$on('sendLoadTestOrganisationStudents', (data) => { socket.emit('sendLoadTestOrganisationStudents', data) })

bus.$on('sendLoadStudentTestInstances', (data) => { socket.emit('sendLoadStudentTestInstances', data) })

bus.$on('sendCreateTestInstance', (data) => { socket.emit('sendCreateTestInstance', data) })

bus.$on('sendLoadTestInstance', (data) => { socket.emit('sendLoadTestInstance', data) })

bus.$on('sendSetAnswer', (data) => { socket.emit('sendSetAnswer', data) })

// Facilitator

bus.$on('sendAddOrganisation', (data) => { socket.emit('sendAddOrganisation', data) })

bus.$on('sendUpdateOrganisation', (data) => { socket.emit('sendUpdateOrganisation', data) })

bus.$on('sendSetOrganisationTest', (data) => { socket.emit('sendSetOrganisationTest', data) })

bus.$on('sendDeleteOrganisation', (data) => { socket.emit('sendDeleteOrganisation', data) })

bus.$on('sendLoadStudents', (data) => { socket.emit('sendLoadStudents', data) })

bus.$on('sendAddStudent', (data) => { socket.emit('sendAddStudent', data) })

bus.$on('sendUpdateStudent', (data) => { socket.emit('sendUpdateStudent', data) })

bus.$on('sendDeleteStudent', (data) => { socket.emit('sendDeleteStudent', data) })

bus.$on('sendAddTest', (data) => { socket.emit('sendAddTest', data) })

bus.$on('sendUpdateTest', (data) => { socket.emit('sendUpdateTest', data) })

bus.$on('sendDeleteTest', (data) => { socket.emit('sendDeleteTest', data) })

bus.$on('sendLoadSections', (data) => { socket.emit('sendLoadSections', data) })

bus.$on('sendAddSection', (data) => { socket.emit('sendAddSection', data) })

bus.$on('sendUpdateSection', (data) => { socket.emit('sendUpdateSection', data) })

bus.$on('sendUpdateSectionQuestionsToShow', (data) => { socket.emit('sendUpdateSectionQuestionsToShow', data) })

bus.$on('sendMoveSectionUp', (data) => { socket.emit('sendMoveSectionUp', data) })

bus.$on('sendMoveSectionDown', (data) => { socket.emit('sendMoveSectionDown', data) })

bus.$on('sendDeleteSection', (data) => { socket.emit('sendDeleteSection', data) })

bus.$on('sendLoadQuestions', (data) => { socket.emit('sendLoadQuestions', data) })

bus.$on('sendAddQuestion', (data) => { socket.emit('sendAddQuestion', data) })

bus.$on('sendDeleteQuestion', (data) => { socket.emit('sendDeleteQuestion', data) })

bus.$on('sendMoveQuestionUp', (data) => { socket.emit('sendMoveQuestionUp', data) })

bus.$on('sendMoveQuestionDown', (data) => { socket.emit('sendMoveQuestionDown', data) })

bus.$on('sendSaveQuestionType', (data) => { socket.emit('sendSaveQuestionType', data) })

bus.$on('sendSaveQuestionQuestion', (data) => { socket.emit('sendSaveQuestionQuestion', data) })

bus.$on('sendAddAnswer', (data) => { socket.emit('sendAddAnswer', data) })

bus.$on('sendSaveAnswer', (data) => { socket.emit('sendSaveAnswer', data) })

bus.$on('sendDeleteAnswer', (data) => { socket.emit('sendDeleteAnswer', data) })

bus.$on('sendMakeAnswer', (data) => { socket.emit('sendMakeAnswer', data) })

bus.$on('sendMoveAnswerUp', (data) => { socket.emit('sendMoveAnswerUp', data) })

bus.$on('sendMoveAnswerDown', (data) => { socket.emit('sendMoveAnswerDown', data) })

bus.$on('sendDeleteAnswer', (data) => { socket.emit('sendDeleteAnswer', data) })

bus.$on('sendMakeTrueFalseAnswer', (data) => { socket.emit('sendMakeTrueFalseAnswer', data) })


// --- Receive ---

socket.on('loadOrganisations', (data) => { bus.$emit('loadOrganisations', data) })

socket.on('loadStudents', (data) => { bus.$emit('loadStudents', data) })

socket.on('loadTests', (data) => { bus.$emit('loadTests', data) })

socket.on('loadSections', (data) => { bus.$emit('loadSections', data) })

socket.on('loadQuestions', (data) => { bus.$emit('loadQuestions', data) })

socket.on('loadTestInstances', (data) => { bus.$emit('loadTestInstances', data) })

socket.on('loadTestOrganisationStudents', (data) => { bus.$emit('loadTestOrganisationStudents', data) })

socket.on('loadStudentTestInstances', (data) => { bus.$emit('loadStudentTestInstances', data) })

socket.on('loadTestInstance', (data) => { bus.$emit('loadTestInstance', data) })

export default bus
