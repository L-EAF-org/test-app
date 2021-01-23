<template>
  <div class="score rounded">
    <h5>Score - {{ score() }}/{{ noOfQuestions }}</h5>
  </div>
</template>

<script>
export default {
  computed: {
    noOfQuestions() {
      return this.$store.getters.getNoOfQuestions
    },
    testInstance() {
      return this.$store.getters.getTestInstance
    }
  },
  methods: {
    score() {
      return this.testInstance.correct ? this.testInstance.correct.questions : 0
    }
  }
}
</script>

<style lang="scss">
  .score {
    position: fixed;
    top: 60px;
    right: 10px;
    border: 1px solid;
    background-color: #fff;
    box-shadow: 2px 2px 3px #444;
    padding: 6px;
  }
</style>
