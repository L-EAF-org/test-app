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
                <option value="">
                  -- Select --
                </option>
                <option v-for="(test, tindex) in tests" :key="tindex" :value="test.id">
                  {{ test.test }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              Section
            </td>
            <td>
              <select id="section" class="question-select" @change="loadQuestions()">
                <option value="">
                  -- Select --
                </option>
                <option v-for="(section, sindex) in sections" :key="sindex" :value="section.id">
                  {{ section.section }}
                </option>
              </select>
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
              <i title="Delete" class="fas fa-trash-alt" @click="deleteQuestion(question.id)" />

              <i v-if="currentQuestionId == question.id" @click="saveQuestion()" title="Save question" class="fas fa-save" />
              <i v-if="currentQuestionId != question.id" @click="editQuestion(question)" title="Edit question" class="fas fa-edit" />
              <i v-if="index > 0" title="Move Question Up" class="fas fa-chevron-up" @click="moveUp(question.id, question.order)" />
              <i v-if="index < questions.length - 1" title="Move Question Down" class="fas fa-chevron-down" @click="moveDown(question.id, question.order)" />
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
                         :checked="!question.multiple && !question.trueFalse" @click="saveQuestionType()"
                  > Choose one answer
                  <input :name="'question-type-' + question.id" :id="'question-type-true-false-' + question.id" type="radio"
                         :checked="question.trueFalse" @click="saveQuestionType()"
                  > True/False
                  <input :name="'question-type-' + question.id" :id="'question-type-multiple-' + question.id" type="radio"
                         :checked="question.multiple && !question.trueFalse" @click="saveQuestionType()"
                  > Select all that apply
                </div>
                <table class="answers" v-if="!question.trueFalse">
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
                      <i title="Save Answer" @click="saveAnswer(answer.id)" class="fas fa-save" />
                      <i title="Delete Answer" class="fas fa-trash-alt" @click="deleteAnswer(answer.id)" />
                      <i v-if="aindex > 0" title="Move Answer Up" class="fas fa-chevron-up" @click="moveAnswerUp(answer.id, answer.order)" />
                      <i v-if="aindex < question.answers.length - 1" title="Move Answer Down" class="fas fa-chevron-down" @click="moveAnswerDown(answer.id, answer.order)" />
                    </td>
                    <td>
                      <input type="checkbox" :checked="answer.answer" @click="makeAnswer(answer.id)">
                    </td>
                    <td>
                      <input type="text" :id="'answer-' + answer.id" :value="answer.value">
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
                <div v-if="question.trueFalse" class="true-false">
                  Correct Answer:
                  True <input :name="'answer-' + question.id" type="radio" :checked="question.answer" @click="setTrueFalseAnswer(question.id, true)">
                  False <input :name="'answer-' + question.id" type="radio" :checked="!question.answer" @click="setTrueFalseAnswer(question.id, false)">
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</template>

<script>
import bus from '../../socket.js'

export default {
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
  methods: {
    setShowTestQuestions(val) {
      this.showTestQuestions = val
    },
    editQuestion(question) {
      this.currentQuestionId = question.id
    },
    loadSections() {
      this.currentTest = document.getElementById('test').value
      bus.$emit('sendLoadSections', {testId: this.currentTest})
    },
    loadQuestions() {
      this.currentSection = document.getElementById('section').value
      bus.$emit('sendLoadQuestions', {testId: this.currentTest, sectionId: this.currentSection})
    },
    addQuestion() {
      const question = document.getElementById('new-question').value
      if (!question) {
        alert('Please enter a value')
      } else {
        bus.$emit('sendAddQuestion', {testId: this.currentTest, sectionId: this.currentSection, question: question})
        document.getElementById('new-question').value = ''
      }
    },
    deleteQuestion(id) {
      if (confirm('Delete Question?')) {
        bus.$emit('sendDeleteQuestion', {testId: this.currentTest, sectionId: this.currentSection, id: id})
      }
    },
    moveUp(id, order) {
      bus.$emit('sendMoveQuestionUp', {testId: this.currentTest, sectionId: this.currentSection, questionId: id, order: order})
    },
    moveDown(id, order) {
      bus.$emit('sendMoveQuestionDown', {testId: this.currentTest, sectionId: this.currentSection, questionId: id, order: order})
    },
    saveQuestionType() {
      const multiple = document.getElementById('question-type-multiple-' + this.currentQuestionId).checked
      const trueFalse = document.getElementById('question-type-true-false-' + this.currentQuestionId).checked
      bus.$emit('sendSaveQuestionType', {testId: this.currentTest, sectionId: this.currentSection, questionId: this.currentQuestionId, multiple: multiple, trueFalse: trueFalse})
    },
    saveQuestion() {
      const question = document.getElementById('question-' + this.currentQuestionId).value
      if (!question) {
        alert('Please enter a value')
      } else {
        bus.$emit('sendSaveQuestionQuestion', {testId: this.currentTest, sectionId: this.currentSection, questionId: this.currentQuestionId, question: question})
        this.currentQuestionId = ''
      }
    },
    addAnswer() {
      const answer = document.getElementById('new-answer').value
      if (!answer) {
        alert('Please enter a value')
      } else {
        bus.$emit('sendAddAnswer', {testId: this.currentTest, sectionId: this.currentSection, questionId: this.currentQuestionId, answer: answer})
        document.getElementById('new-answer').value = ''
      }
    },
    saveAnswer(id) {
      const answer = document.getElementById('answer-' + id).value
      if (!answer) {
        alert('Please enter a value')
      } else {
        bus.$emit('sendSaveAnswer', {testId: this.currentTest, sectionId: this.currentSection, questionId: this.currentQuestionId, id: id, value: answer})
      }
    },
    makeAnswer(answerId) {
      bus.$emit('sendMakeAnswer', {testId: this.currentTest, sectionId: this.currentSection, questionId: this.currentQuestionId, answerId: answerId})
    },
    moveAnswerUp(id, order) {
      bus.$emit('sendMoveAnswerUp', {testId: this.currentTest, sectionId: this.currentSection, questionId: this.currentQuestionId, id: id, order: order})
    },
    moveAnswerDown(id, order) {
      bus.$emit('sendMoveAnswerDown', {testId: this.currentTest, sectionId: this.currentSection, questionId: this.currentQuestionId, id: id, order: order})
    },
    deleteAnswer(id) {
      if (confirm('Delete Answer?')) {
        bus.$emit('sendDeleteAnswer', {testId: this.currentTest, sectionId: this.currentSection, questionId: this.currentQuestionId, id: id})
      }
    },
    setTrueFalseAnswer(questionId, val) {
      bus.$emit('sendMakeTrueFalseAnswer', {testId: this.currentTest, sectionId: this.currentSection, questionId: this.currentQuestionId, val: val})
    },

  }
}
</script>

<style lang="scss">
  .config-test-questions {

    .question-select {
      width: 200px;
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

    .true-false {
      margin-top: 16px;
      text-align: center;

      input {
        height: 20px;
        position: relative;
        top: 5px;
      }
    }
  }
</style>
