<template>
  <table class="config-test-organisations">
    <tr>
      <td>
        <h4>Organisations</h4>
        <i v-if="showTestOrganisations" @click="setShowTestOrganisations(false)" title="collapse" class="fas fa-caret-up toggle" />
        <i v-if="!showTestOrganisations" @click="setShowTestOrganisations(true)" title="expand" class="fas fa-caret-down toggle" />
      </td>
    </tr>
    <tr v-if="showTestOrganisations">
      <td>
        <table>
          <tr>
            <td colspan="2">
              New Organisation <input type="text" class="new-organisation" id="new-organisation">
              <button class="btn btn-sm btn-site-primary" @click="addOrganisation()">
                Add
              </button>
            </td>
          </tr>
          <tr v-for="(organisation, index) in organisations" :key="index">
            <td>
              <i @click="updateOrganisation(organisation.id)" :title="'Update ' + organisation.organisation + ' Name'" class="fas fa-save" />
              <i @click="deleteOrganisation(organisation.id)" :title="'Delete ' + organisation.organisation" class="fas fa-trash-alt" />
              <i v-if="currentOrganisation.id != organisation.id" @click="updateOrganisationTests(organisation)" :title="'Update ' + organisation.organisation + ' Tests'" class="fas fa-clone" />
              <i v-if="currentOrganisation.id == organisation.id" @click="updateOrganisationTests('')" :title="'Close ' + organisation.organisation + ' Tests'" class="far fa-clone" />
            </td>
            <td>
              <input type="text" :value="organisation.organisation" :id="'organisation-' + organisation.id">
            </td>
            <td>
              <table v-if="currentOrganisation.id == organisation.id">
                <tr v-for="(test, tindex) in tests" :key="tindex">
                  <td>
                    <input type="checkbox" :id="'organisation-test-' + test.id" @click="setOrganisationTest(test.id, test.test)" :checked="organisationTest(organisation, test.id)">
                    {{ test.test }}
                  </td>
                </tr>
              </table>
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
      showTestOrganisations: false,
      currentOrganisation: ''
    }
  },
  computed: {
    organisations() {
      return this.$store.getters.getOrganisations
    },
    tests() {
      return this.$store.getters.getTests
    }
  },
  methods: {
    setShowTestOrganisations(val) {
      this.showTestOrganisations = val
    },
    addOrganisation() {
      const organisation = document.getElementById('new-organisation').value
      if (!organisation) {
        alert('Please enter a value')
      } else {
        this.socket.emit('addOrganisation', {organisation: organisation})
        document.getElementById('new-organisation').value = ''
      }
    },
    updateOrganisation(id) {
      const organisation = document.getElementById('organisation-' + id).value
      if (!organisation) {
        alert('Please enter a value')
      } else {
        this.socket.emit('updateOrganisation', {organisationId: id, organisation: organisation})
      }
    },
    updateOrganisationTests(organisation) {
      this.currentOrganisation = organisation
    },
    setOrganisationTest(id, test) {
      const val = document.getElementById('organisation-test-' + id).checked
      this.socket.emit('setOrganisationTest', {organisationId: this.currentOrganisation.id, testId: id, test: test, value: val})
    },
    organisationTest(organisation, id) {
      return organisation.tests && organisation.tests[id] ? organisation.tests[id].value : false
    },
    deleteOrganisation(id) {
      this.socket.emit('deleteOrganisation', {organisationId: id})
    }
  }
}
</script>

<style lang="scss">
  .config-test-organisations {

    .new-organisation {
      width: 200px !important;
    }

    input[type=text] {
      width: 200px;
    }
  }
</style>
