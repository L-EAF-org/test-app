<template>
  <div class="test-questions">
    <div>
      Test:
      <select id="test-select" @change="loadTest()">
        <option value="">
          -- Select --
        </option>
        <option v-for="(t, index) in tests" :key="index" :value="t.id">
          {{ t.test }}
        </option>
      </select>
    </div>
    <h2>{{ test.test }}</h2>
    <div v-for="(section, sindex) in test.sections" :key="sindex">
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
              <input v-if="!question.multiple" type="radio" :name="'question-' + question.id">
              <input v-if="question.multiple" type="checkbox">
            </td>
            <td v-if="!question.trueFalse">
              {{ answer.value }}
            </td>
          </tr>
          <tr v-if="question.trueFalse">
            <td colspan="2" v-if="question.trueFalse">
              True <input :id="'question-true-' + question.id" type="checkbox" @click="setTrue(question.id)">
              False <input :id="'question-false-' + question.id" type="checkbox" @click="setFalse(question.id)">
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'socket'
  ],
  computed: {
    test() {
      return this.$store.getters.getTest
    },
    tests() {
      return this.$store.getters.getTests
    },
    questions() {
      return this.$store.getters.getQuestions
    }
  },
  created() {
    this.socket.on('loadTests', (data) => {
      this.$store.dispatch('loadTests', data)
    })

    this.socket.on('loadTest', (data) => {
      this.$store.dispatch('loadTest', data)
    })
  },
  methods: {
    loadTest() {
      const id = document.getElementById('test-select').value
      this.socket.emit('loadTest', {id: id})
    },
    setTrue(id) {
      document.getElementById('question-true-' + id).checked = true
      document.getElementById('question-false-' + id).checked = false
    },
    setFalse(id) {
      document.getElementById('question-false-' + id).checked = true
      document.getElementById('question-true-' + id).checked = false
    }
  }
}
</script>

<style lang="scss">
  .test-questions {
    h3 {
      text-align: left;
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
</style>
