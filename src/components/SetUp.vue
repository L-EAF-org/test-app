<template>
  <div>
    <Organisations :socket="socket" />
    <Students :socket="socket" />
    <Tests :socket="socket" />
    <Sections :socket="socket" />
    <Questions :socket="socket" />
  </div>
</template>

<script>
import Organisations from './setup/Organisations.vue'
import Students from './setup/Students.vue'
import Tests from './setup/Tests.vue'
import Sections from './setup/Sections.vue'
import Questions from './setup/Questions.vue'

export default {
  components: {
    Organisations,
    Students,
    Tests,
    Sections,
    Questions
  },
  props: [
    'socket'
  ]
}
</script>
