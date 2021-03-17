<template>
  <div>
    <Organisations />
    <Students />
    <Tests />
    <Sections />
    <Questions />
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
  }
}
</script>

<style lang="scss">
.config-test-organisations, .config-test-students,
.config-test-tests, .config-test-sections,
.config-test-questions {
  width: 100%;
  margin: 12px;
  border: 1px solid #ccc;

  .toggle {
    color: #aaa;
    font-size: xx-large;

    &:hover {
      cursor: pointer;
    }
  }

  .left {
    text-align: left;
  }

  h4 {
    width: 50%;
    display: inline-block;
    text-align: left;
  }

  span, i.toggle {
    position: absolute;
    right: 6px;
  }

  td {
    vertical-align: top;
    position: relative;
    padding: 4px;
    text-align: left;

    &.center {
      text-align: center;
    }
    &.left-col {
      vertical-align: top;
    }
    .fa-edit, .fa-save, .fa-trash-alt, .fa-chevron-up, .fa-chevron-down, .fa-file-alt, .fa-clone {
      color: #888;
      font-size: x-large;
      margin: 4px;

      &:hover {
        cursor: pointer;
        color: #444;
      }
    }
  }

  input {
    height: 24px;
    padding: 2px;
    margin: 0 auto;
  }

  button {
    margin-left: 4px;
  }
}
</style>
