<template>
  <div class="test-questions">
    <div v-for="(question, index) in questions" :key="index">
      <div class="question">
        <h5>{{ question.question }}?</h5>
      </div>
      <div class="answers" />
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'socket'
  ],
  computed: {
    questions() {
      return this.$store.getters.getQuestions
    }
  },
  methods: {
  }
}
</script>

<style lang="scss">
  .test-questions {
    h5 {
      width: 100%;
      text-align: left;
    }
  }
</style>
