<template>
  <table class="config-test-students">
    <tr>
      <td>
        <h4>Students</h4>
        <i v-if="showTestStudents" @click="setShowTestStudents(false)" title="collapse" class="fas fa-caret-up toggle" />
        <i v-if="!showTestStudents" @click="setShowTestStudents(true)" title="expand" class="fas fa-caret-down toggle" />
      </td>
    </tr>
    <tr v-if="showTestStudents">
      <td>
        <table>
          <tr>
            <td>
              Organisation:
            </td>
            <td>
              <select id="student-organisations" class="organisation-select" @change="loadStudents()">
                <option value="">
                  -- Select --
                </option>
                <option v-for="(organisation, index) in organisations" :key="index" :value="organisation.id">
                  {{ organisation.organisation }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              New Student <input type="text" class="new-student" id="new-student">
              <button class="btn btn-sm btn-site-primary" @click="addStudent()">
                Add
              </button>
            </td>
          </tr>
          <tr v-for="(student, index) in students" :key="index">
            <td>
              <i @click="updateStudent(student.id)" title="Update Student Name" class="fas fa-save" />
              <i @click="deleteStudent(student.id)" title="Delete Student" class="fas fa-trash-alt" />
            </td>
            <td>
              <input type="text" :value="student.student" :id="'student-' + student.id">
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
      showTestStudents: false,
      currentOrganisation: ''
    }
  },
  computed: {
    organisations() {
      return this.$store.getters.getOrganisations
    },
    students() {
      return this.$store.getters.getStudents
    }
  },
  methods: {
    setShowTestStudents(val) {
      this.showTestStudents = val
    },
    loadStudents() {
      this.currentOrganisation = document.getElementById('student-organisations').value
      this.socket.emit('loadStudents', {organisationId: this.currentOrganisation})
    },
    addStudent() {
      const student = document.getElementById('new-student').value
      if (!student) {
        alert('Please enter a value')
      } else {
        this.socket.emit('addStudent', {organisationId: this.currentOrganisation, student: student})
        document.getElementById('new-student').value = ''
      }
    },
    updateStudent(id) {
      const student = document.getElementById('student-' + id).value
      if (!student) {
        alert('Please enter a value')
      } else {
        this.socket.emit('updateStudent', {organisationId: this.currentOrganisation, studentId: id, student: student})
      }
    },
    deleteStudent(id) {
      this.socket.emit('deleteStudent', {organisationId: this.currentOrganisation, studentId: id})
    }
  }
}
</script>

<style lang="scss">
  .config-test-students {

    .organisation-select {
      width: 200px;
    }

    .new-student {
      width: 200px !important;
    }

    input[type=text] {
      width: 200px;
    }
  }
</style>
