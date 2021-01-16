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
              <i @click="updateSection(section.id)" title="Update Section Name" class="fas fa-save" />
              <i @click="deleteSection(section.id)" title="Delete Section" class="fas fa-trash-alt" />
              <i v-if="index > 0" title="Move Up" class="fas fa-chevron-up" @click="moveUp(section.id, section.order)" />
              <i v-if="index < sections.length - 1" title="Move Down" class="fas fa-chevron-down" @click="moveDown(section.id, section.order)" />
            </td>
            <td>
              {{ section. order }}
              <input type="text" :value="section.section" :id="'section-' + section.id">
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
      this.socket.emit('loadSections', {testId: this.currentTest})
    },
    addSection() {
      const section = document.getElementById('new-section').value
      this.socket.emit('addSection', {testId: this.currentTest, section: section})
      document.getElementById('new-section').value = ''
    },
    updateSection(id) {
      const section = document.getElementById('section-' + id).value
      this.socket.emit('updateSection', {testId: this.currentTest, sectionId: id, section: section})
    },
    moveUp(id, order) {
      this.socket.emit('moveSectionUp', {testId: this.currentTest, sectionId: id, order: order})
    },
    moveDown(id, order) {
      this.socket.emit('moveSectionDown', {testId: this.currentTest, sectionId: id, order: order})
    },
    deleteSection(id) {
      this.socket.emit('deleteSection', {testId: this.currentTest, sectionId: id})
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
  }
</style>
