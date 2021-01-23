<template>
  <div class="results">
    <h2>
      Results
    </h2>
    <div>
      <button class="btn btn-sm btn-site-primary submit-test" @click="loadTestInstances()">
        Load Tests
      </button>
    </div>
    <table>
      <thead>
        <tr>
          <td>Name</td>
          <td>Date</td>
          <td>Organisation</td>
          <td>Test</td>
          <td>Score</td>
          <td />
        </tr>
      </thead>
      <tbody v-if="!details">
        <tr v-for="(testInstance, index) in testInstances" :key="index">
          <td>{{ testInstance.student.student }}</td>
          <td>{{ dateString(testInstance.date) }}</td>
          <td>{{ testInstance.organisation.organisation }}</td>
          <td>{{ testInstance.test.test }}</td>
          <td>{{ testInstance.correct.questions }} / {{ noOfQuestions(testInstance.id) }}</td>
          <td>
            <button v-if="details != testInstance.id" class="btn btn-sm btn-site-primary submit-test" @click="showDetails(testInstance)">
              Show Details
            </button>
            <button class="btn btn-sm btn-site-primary submit-test" @click="deleteTestInstance(testInstance.id)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
      <tbody v-if="details">
        <tr>
          <td>{{ details.student.student }}</td>
          <td>{{ dateString(details.date) }}</td>
          <td>{{ details.organisation.organisation }}</td>
          <td>{{ details.test.test }}</td>
          <td>{{ details.correct.questions }} / {{ noOfQuestions(details.id) }}</td>
          <td>
            <button class="btn btn-sm btn-site-primary submit-test" @click="hideDetails()">
              Hide Details
            </button>
          </td>
        </tr>
        <tr>
          <td colspan="6">
            <div v-for="(section, sindex) in details.test.sections" :key="sindex" class="details">
              <h5>{{ section.section }}</h5>
              <div v-for="(question, qindex) in section.questions" :key="qindex" class="details-question">
                <div class="question-correct">
                  <i v-if="question.correct" class="fas fa-check" />
                  <i v-if="!question.correct" class="fas fa-times" />
                </div>
                <div>
                  {{ question.question }}
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import dateTime from '../lib/dateTime.js'

export default {
  props: [
    'socket'
  ],
  data() {
    return {
      testInstances: [],
      details: null
    }
  },
  created() {
    const self = this

    this.socket.on('loadTestInstances', (data) => {
      self.testInstances = data
    })
  },
  methods: {
    dateString(s) {
      return dateTime.format(s)
    },
    noOfQuestions(id) {
      const testInstance = this.testInstances.find(function(t) {
        return t.id == id
      })
      let n = 0
      for (let i = 0; i < testInstance.test.sections.length; i++) {
        n = n + testInstance.test.sections[i].questions.length
      }
      return n
    },
    showDetails(instance) {
      this.details = instance
    },
    hideDetails() {
      this.details = null
    },
    loadTestInstances() {
      this.socket.emit('loadTestInstances')
    },
    deleteTestInstance(id) {
      this.socket.emit('deleteTestInstance', {id: id})
    }
  }
}
</script>

<style lang="scss">
  .results {

    table {
      width: 80%;
      margin: 12px auto;

      th, td {
        border: 1px solid;
      }

      h5 {
        margin-top: 12px;
      }
      .details {
        text-align: left;
      }

      .details-question {
        padding-left: 12px;

        div {
          display: inline-block;
        }
        .question-correct {
          width: 36px;
          text-align: center;
        }
      }

      .fas {
        font-size: large;

        &.fa-check {
          color: green;
        }
        &.fa-times {
          color: red;
        }
      }
    }
  }
</style>
