<template>
  <table class="config-test-questions">
    <tr>
      <td>
        <h4>Questions</h4>
        <i v-if="showTestQuestions" @click="setShowTestQuestions(false)" title="collapse" class="fas fa-caret-up toggle" />
        <i v-if="!showTestQuestions" @click="setShowTestQuestions(true)" title="expand" class="fas fa-caret-down toggle" />
      </td>
    </tr>
    <tr v-if="showTestQuestions">
      <td>
        <table>
          <tr>
            <td>
              Test
            </td>
            <td>
              <select id="test" class="question-select" @change="loadSections()">
                <option> -- Select -- </option>
                <option v-for="(test, tindex) in tests" :key="tindex">
                  {{ test.test }}
                </option>
              </select>
            </td>
            <td>
              New: <input type="text" class="new-test" id="new-test">
              <button class="btn btn-sm btn-site-primary" @click="addTest()">
                Add
              </button>
            </td>
          </tr>
          <tr>
            <td>
              Section
            </td>
            <td>
              <select id="section" class="question-select" @change="loadQuestions()">
                <option> -- Select -- </option>
                <option v-for="(section, sindex) in sections" :key="sindex">
                  {{ section.section }}
                </option>
              </select>
            </td>
            <td>
              New: <input type="text" class="new-test" id="new-section">
              <button class="btn btn-sm btn-site-primary" @click="addSection()">
                Add
              </button>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr v-if="showTestQuestions">
      <td>
        <table>
          <tr class="question">
            <td class="header">
              <button class="btn btn-sm btn-site-primary" @click="addQuestion()">
                Add New
              </button>
            </td>
            <td>
              <input id="new-question" type="text" class="question-text">
            </td>
          </tr>
          <tr v-for="(question, index) in questions" :key="index" class="question">
            <td class="header">
              <i v-if="currentQuestionId == question.id" @click="saveQuestion()" title="save" class="fas fa-save" />
              <i v-if="currentQuestionId != question.id" @click="editQuestion(question)" title="edit" class="fas fa-edit" />
            </td>
            <td>
              <div v-if="currentQuestionId != question.id" class="question-text">
                {{ question.question }}
              </div>
              <div v-if="currentQuestionId == question.id">
                <div>
                  <input :id="'question-' + question.id" type="text" class="question-text" :value="question.question">
                </div>
                <div class="answer-type">
                  Answer Type:
                  <input :name="'question-type-' + question.id" :id="'question-type-single-' + question.id" type="radio"
                         :checked="!question.multiple" @click="saveQuestionType()"> Choose one answer
                  <input :name="'question-type-' + question.id" :id="'question-type-multiple-' + question.id" type="radio"
                         :checked="question.multiple" @click="saveQuestionType()"> Select all that apply
                </div>
                <table class="answers">
                  <tr>
                    <td class="header">
                      Actions
                    </td>
                    <td class="header">
                      Correct?
                    </td>
                    <td class="header answer">
                      Answers
                    </td>
                  </tr>
                  <tr v-for="(answer, aindex) in question.answers" :key="aindex">
                    <td>
                      <i title="Delete" class="fas fa-trash-alt" @click="deleteAnswer(question.id, answer.id)" />
                      <i v-if="aindex > 0" title="Move Up" class="fas fa-chevron-up" @click="moveAnswerUp(question.id, answer.id)" />
                      <i v-if="aindex < question.answers.length - 1" title="Move Down" class="fas fa-chevron-down" @click="moveAnswerDown(question.id, answer.id)" />
                    </td>
                    <td>
                      <input type="checkbox" :checked="answer.answer" @click="makeAnswer(answer.id)">
                    </td>
                    <td>
                      <input type="text" :value="answer.value">
                    </td>
                  </tr>
                  <tr>
                    <td colspan="3">
                      New Answer: <input id="new-answer" type="text">
                      <button class="btn btn-sm btn-site-primary" @click="addAnswer()">
                        Add
                      </button>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  props: [
    'socket'
  ],
  data() {
    return {
      showTestQuestions: false,
      currentQuestionId: null,
      currentTest: '',
      currentSection: ''
    }
  },
  computed: {
    tests() {
      return this.$store.getters.getTests
    },
    sections() {
      return this.$store.getters.getSections
    },
    questions() {
      return this.$store.getters.getQuestions
    }
  },
  created() {
    this.socket.on('loadTests', (data) => {
      this.$store.dispatch('loadTests', data)
    })

    this.socket.on('loadSections', (data) => {
      this.$store.dispatch('loadSections', data)
    })

    this.socket.on('loadQuestions', (data) => {
      this.$store.dispatch('loadQuestions', data)
    })

    this.socket.emit('loadTests')
  },
  methods: {
    setShowTestQuestions(val) {
      this.showTestQuestions = val
    },
    editQuestion(question) {
      this.currentQuestionId = question.id
    },
    addTest() {
      const test = document.getElementById('new-test').value
      this.socket.emit('addTest', {test: test})
    },
    loadSections() {
      this.currentTest = document.getElementById('test').value
      this.socket.emit('loadSections', {test: this.currentTest})
    },
    addSection() {
      const section = document.getElementById('new-section').value
      this.socket.emit('addSection', {test: this.currentTest, section: section})
    },
    loadQuestions() {
      this.currentSection = document.getElementById('section').value
      this.socket.emit('loadQuestions', {test: this.currentTest, section: this.currentSection})
    },
    addQuestion() {
      const question = document.getElementById('new-question').value
      this.socket.emit('addQuestion', {test: this.currentTest, section: this.currentSection, question: question})
    },
    saveQuestionType() {
      const multiple = document.getElementById('question-type-multiple-' + this.currentQuestionId).checked
      this.socket.emit('saveQuestionType', {test: this.currentTest, section: this.currentSection, questionId: this.currentQuestionId, multiple: multiple})
    },
    saveQuestion() {
      const question = document.getElementById('question-' + this.currentQuestionId).value
      this.socket.emit('saveQuestionQuestion', {test: this.currentTest, section: this.currentSection, questionId: this.currentQuestionId, question: question})
      this.currentQuestionId = ''
    },
    addAnswer() {
      const answer = document.getElementById('new-answer').value
      this.socket.emit('addAnswer', {test: this.currentTest, section: this.currentSection, questionId: this.currentQuestionId, answer: answer})
    },
    makeAnswer(answerId) {
      this.socket.emit('makeAnswer', {test: this.currentTest, section: this.currentSection, questionId: this.currentQuestionId, answerId: answerId})
    }
  }
}
</script>

<style lang="scss">
  .config-test-questions {

    button {
      margin-left: 4px;
    }

    .question-select {
      width: 200px;
    }

    .new-test {
      width: 200px !important;
    }

    .question-text {
      font-size: x-large;
    }

    .answer-type {
      margin-left: 32px;

      input {
        height: 20px;
        position: relative;
        top: 5px;
      }
    }

    input[type=text] {
      width: 100%;

      &.question-text {
        padding: 3px;
        height: 35px;
      }
    }

    table {
      width: 100%;

      .header {
        text-align: center;
        font-weight: bold;

        &.answer {
          width: 75%;
        }
      }
    }

    #new-answer {
      width: 75%;
    }

    .answers {
      width: 90%;
      margin: 12px 0 12px 32px;
      td {
        text-align: center;
      }
    }
  }
</style>
