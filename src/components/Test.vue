<template>
  <div class="test-questions">
    <Score v-if="isHost" />
    <div v-if="testInstance.test">
      Correct: {{ testInstance.test.currect }}
    </div>
    <div class="test-set-up">
      Organisation:
      <select id="test-organisation" @change="loadSelectedOrganisation()">
        <option value="">
          -- Select --
        </option>
        <option v-for="(o, oindex) in organisations" :key="oindex" :value="o.id">
          {{ o.organisation }}
        </option>
      </select>
      Test:
      <select id="test-test" @change="setTest()">
        <option value="">
          -- Select --
        </option>
        <option v-for="(t, tindex) in tests" :key="tindex" :value="t.id">
          {{ t.test }}
        </option>
      </select>
      Student:
      <select id="test-student" @change="setStudent()">
        <option value="">
          -- Select --
        </option>
        <option v-for="(s, sindex) in students" :key="sindex" :value="s.id">
          {{ s.student }}
        </option>
      </select>
    </div>
    <div class="test-set-up">
      <div v-if="student.id">
        Continue:
        <select id="test-instance" @change="loadTestInstance()">
          <option value="">
            -- Select --
          </option>
          <option v-for="(tInstance, index) in testInstances" :key="index" :value="tInstance.id">
            {{ testInstanceLabel(tInstance) }}
          </option>
        </select>
        <button class="btn btn-sm btn-site-primary submit-test" @click="createTestInstance()" :disabled="!(organisationId && test.id && student.id)">
          Start New
        </button>
      </div>
    </div>
    <h2>
      <span v-if="test.test">{{ test.test }}</span>
      <span v-if="test.test && student.id"> - </span>
      <span v-if="student.id">{{ student.student }}</span>
      <button class="btn btn-sm btn-site-primary submit-test" @click="submitTest()" :disabled="!test.id">
        Submit Test
      </button>
    </h2>
    <div v-if="testInstance.test" class="test-sections">
      <div v-for="(section, sindex) in testInstance.test.sections" :key="sindex">
        <h3>{{ section.section }}</h3>
        <div v-for="(question, qindex) in section.questions" :key="qindex">
          <div class="question">
            <h5>{{ question.question }}?</h5>
          </div>
          <table class="answers">
            <tr v-if="question.multiple">
              <td colspan="2">
                <i>Tick all that apply</i>
              </td>
            </tr>
            <tr v-for="(answer, aindex) in question.answers" :key="aindex" class="answer">
              <td v-if="!question.trueFalse">
                <input v-if="!question.multiple" type="radio" :name="'answer-' + question.id"
                       :id="'answer-' + answer.id" @click="setAnswer(question, answer)" :checked="answer.submittedAnswer"
                >
                <input v-if="question.multiple" type="checkbox" :name="'answer-' + question.id"
                       :id="'answer-' + answer.id" @click="setMultipleAnswer(question)" :checked="answer.submittedAnswer"
                >
              </td>
              <td v-if="!question.trueFalse">
                {{ answer.value }}
                <span v-if="isHost && answer.answer"><i>(answer)</i></span>
              </td>
            </tr>
            <tr v-if="question.trueFalse">
              <td colspan="2" v-if="question.trueFalse">
                True <span v-if="isHost && question.answer"><i>(answer)</i></span>
                <input :id="'question-true-' + question.id" type="checkbox" @click="setTrue(question)" :checked="question.submittedAnswer">
                False <span v-if="isHost && !question.answer"><i>(answer)</i></span>
                <input :id="'question-false-' + question.id" type="checkbox" @click="setFalse(question)" :checked="!question.submittedAnswer">
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { v4: uuidv4 } = require('uuid')

import bus from '../socket.js'

import dateTime from '../lib/dateTime.js'

import Score from './test/Score.vue'

export default {
  components: {
    Score
  },
  data() {
    return {
      tests: [],
      students: [],
      testInstances: [],
      organisationId: null,
      test: {id: '', test: null},
      student: {id: '', test: null},
      answers: {}
    }
  },
  computed: {
    isHost() {
      return this.$store.getters.getHost
    },
    currentTest() {
      return this.$store.getters.getCurrentTest
    },
    organisations() {
      return this.$store.getters.getOrganisations
    },
    testInstance() {
      return this.$store.getters.getTestInstance
    }
  },
  created() {
    const self = this

    bus.$on('loadTestOrganisationStudents', (data) => {
      if (data.organisationId == self.organisationId) {
        self.students = data.students
      }
    })

    bus.$on('loadStudentTestInstances', (data) => {
      if (data.organisationId == this.organisationId && data.testId == self.test.id && data.studentId == self.student.id) {
        self.testInstances = data.testInstances
      }
    })

    bus.$on('loadTestInstance', (data) => {
      if (self.testInstance.id == data.id) {
        self.$store.dispatch('updateTestInstance', data)
      }
    })
  },
  methods: {
    testInstanceLabel(instance) {
      return instance.test.test + ' ' + dateTime.format(instance.date)
    },
    loadSelectedOrganisation() {
      const id = document.getElementById('test-organisation').value
      if (id) {
        const organisation = this.organisations.find(function(o) {
          return o.id == id
        })
        this.tests = []
        if (organisation.tests) {
          const keys = Object.keys(organisation.tests)
          for (let i = 0; i < keys.length; i++) {
            if (organisation.tests[keys[i]].value) {
              this.tests.push({
                id: keys[i],
                test: organisation.tests[keys[i]].test
              })
            }
          }
        }
        this.organisationId = id
        bus.$emit('sendLoadTestOrganisationStudents', {organisationId: id})
      } else {
        this.tests = []
        this.students = []
        this.test = {id: '', test: null}
        this.student = {id: '', student: null}
      }
    },
    setTest() {
      const id = document.getElementById('test-test').value
      if (id) {
        const index = document.getElementById('test-test').options.selectedIndex
        const test = document.getElementById('test-test').options[index].text
        this.test = {id: id, test: test}
      } else {
        this.test = {id: '', test: null}
      }
    },
    setStudent() {
      const id = document.getElementById('test-student').value
      if (id) {
        const index = document.getElementById('test-student').options.selectedIndex
        const student = document.getElementById('test-student').options[index].text
        this.student = {id: id, student: student}
        bus.$emit('sendLoadStudentTestInstances', {organisationId: this.organisationId, testId: this.test.id, studentId: id})
      } else {
        this.student = {id: '', student: null}
      }
    },
    createTestInstance() {
      if (this.organisationId && this.test.id && this.student.id) {
        const id = uuidv4()
        this.$store.dispatch('updateTestInstance', {id: id})
        bus.$emit('sendCreateTestInstance', {id: id, organisationId: this.organisationId, testId: this.test.id, studentId: this.student.id})
      }
    },
    loadTestInstance() {
      const id = document.getElementById('test-instance').value
      if (id) {
        this.$store.dispatch('updateTestInstance', {id: id})
        bus.$emit('sendLoadTestInstance', {id: id})
      } else {
        this.testInstanceId = null
      }
    },
    setAnswer(question, answer) {
      const val = document.getElementById('answer-' + answer.id).checked
      bus.$emit('sendSetAnswer', {testInstanceId: this.testInstance.id, questionId: question.id, answerId: answer.id, value: val})
    },
    setMultipleAnswer(question) {
      const values = document.getElementsByName('answer-' + question.id)
      const answers = []
      for (let i = 0; i < values.length; i++) {
        answers.push({
          id: values[i].id.replace('answer-', ''),
          value: values[i].checked
        })
      }
      bus.$emit('sendSetAnswer', {testInstanceId: this.testInstance.id, questionId: question.id, answerId: null, value: answers})
    },
    setTrue(question) {
      document.getElementById('question-true-' + question.id).checked = true
      document.getElementById('question-false-' + question.id).checked = false
      bus.$emit('sendSetAnswer', {testInstanceId: this.testInstance.id, questionId: question.id, value: true})
    },
    setFalse(question) {
      document.getElementById('question-false-' + question.id).checked = true
      document.getElementById('question-true-' + question.id).checked = false
      bus.$emit('sendSetAnswer', {testInstanceId: this.testInstance.id, questionId: question.id, value: false})
    },
    submitTest() {
      console.log('submit')
      alert('sumbit - TBD')
    }
  }
}
</script>

<style lang="scss">
  .test-questions {

    .test-set-up {
      height: 32px;
      margin-bottom: 24px;

      select {
        width: 160px;
        margin-right: 24px;
      }
    }

    h2 {
      margin-top: 24px;

      .submit-test {
        margin-left: 12px;
      }
    }

    .test-sections {

      h3 {
        text-align: left;
        margin-top: 32px;
      }

      h5 {
        margin-left: 24px;
        text-align: left;
      }
      .answers {
        text-align: left;
        margin-left: 48px;
      }
    }
  }
</style>
