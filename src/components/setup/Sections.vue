<template>
  <table class="config-test-sections">
    <tr>
      <td>
        <h4>Sections</h4>
        <i v-if="showTestSections" @click="setShowTestSections(false)" title="collapse" class="fas fa-caret-up toggle" />
        <i v-if="!showTestSections" @click="setShowTestSections(true)" title="expand" class="fas fa-caret-down toggle" />
      </td>
    </tr>
    <tr v-if="showTestSections">
      <td>
        <table>
          <tr>
            <td>
              Test:
            </td>
            <td>
              <select id="sections-test" class="question-select" @change="loadSections()">
                <option value="">
                  -- Select --
                </option>
                <option v-for="(test, index) in tests" :key="index" :value="test.id">
                  {{ test.test }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              New Section <input type="text" class="new-section" id="new-section">
              <button class="btn btn-sm btn-site-primary" @click="addSection()">
                Add
              </button>
            </td>
          </tr>
          <tr v-for="(section, index) in sections" :key="index">
            <td>
              <i @click="updateSection(section.id)" :title="'Update ' + section.section + ' Name'" class="fas fa-save" />
              <i @click="deleteSection(section.id)" :title="'Delete ' + section.section" class="fas fa-trash-alt" />
              <i v-if="index > 0" :title="'Move ' + section.section + ' Up'" class="fas fa-chevron-up" @click="moveUp(section.id, section.order)" />
              <i v-if="index < sections.length - 1" :title="'Move ' + section.section + ' Down'" class="fas fa-chevron-down" @click="moveDown(section.id, section.order)" />
            </td>
            <td>
              <input type="text" class="section-name" :value="section.section" :id="'section-' + section.id">
              Select <input type="number" :id="'section-questions-' + section.id" @change="questionsToShow(section.id)" :value="section.questionsToShow">
              out of {{ section.questions }}
              questions (<i>leave blank for all</i>)
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
      showTestSections: false,
      currentTest: ''
    }
  },
  computed: {
    tests() {
      return this.$store.getters.getTests
    },
    sections() {
      return this.$store.getters.getSections
    }
  },
  methods: {
    setShowTestSections(val) {
      this.showTestSections = val
    },
    loadSections() {
      this.currentTest = document.getElementById('sections-test').value
      bus.$emit('sendLoadSections', {testId: this.currentTest})
    },
    addSection() {
      const section = document.getElementById('new-section').value
      if (!section) {
        alert('Please enter a value')
      } else {
        bus.$emit('sendAddSection', {testId: this.currentTest, section: section})
        document.getElementById('new-section').value = ''
      }
    },
    updateSection(id) {
      const section = document.getElementById('section-' + id).value
      if (!section) {
        alert('Please enter a value')
      } else {
        bus.$emit('sendUpdateSection', {testId: this.currentTest, sectionId: id, section: section})
      }
    },
    questionsToShow(id) {
      const n = document.getElementById('section-questions-' + id).value
      bus.$emit('sendUpdateSectionQuestionsToShow', {id: id, questionsToShow: n})

    },
    moveUp(id, order) {
      bus.$emit('sendMoveSectionUp', {testId: this.currentTest, sectionId: id, order: order})
    },
    moveDown(id, order) {
      bus.$emit('sendMoveSectionDown', {testId: this.currentTest, sectionId: id, order: order})
    },
    deleteSection(id) {
      if (confirm('Delete Section?')) {
        bus.$emit('sendDeleteSection', {testId: this.currentTest, sectionId: id})
      }
    }
  }
}
</script>

<style lang="scss">
  .config-test-sections {

    .new-section {
      width: 200px !important;
    }

    input[type=text] {
      width: 200px;
    }

    .section-name {
      margin-right: 24px;
    }
  }
</style>
