import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    host: false,
    currentTab: 'test',
    thisGame: 'L-EAF.org Test App',
    test: [],
    organisations: [],
    students: [],
    tests: [],
    sections: [],
    questions: [],
    testInstance: {id: null}
  },
  getters: {
    getHost: (state) => {
      return state.host
    },
    getCurrentTab: (state) => {
      return state.currentTab
    },
    getThisGame: (state) => {
      return state.thisGame
    },
    getTest: (state) => {
      return state.test
    },
    getCurrentTest: (state) => {
      return state.currentTest
    },
    getTests: (state) => {
      return state.tests
    },
    getOrganisations: (state) => {
      return state.organisations
    },
    getStudents: (state) => {
      return state.students.sort(function(a, b) {
        return a.student.localeCompare(b.student)
      })
    },
    getSections: (state) => {
      return state.sections.sort(function(a, b) {
        return a.order - b.order
      })
    },
    getQuestions: (state) => {
      return state.questions.sort(function(a, b) {
        return a.order - b.order
      })
    },
    getNoOfQuestions: (state) => {
      let n = 0
      if (state.testInstance.test) {
        for (let i = 0; i < state.testInstance.test.sections.length; i++) {
          n = n + state.testInstance.test.sections[i].questions.length
        }
      }
      return n
    },
    getTestInstance: (state) => {
      return state.testInstance
    },
  },
  mutations: {
    updateHost: (state, payload) => {
      state.host = payload
    },
    updateCurrentTab: (state, payload) => {
      state.currentTab = payload
    },
    loadTests: (state, payload) => {
      state.tests = payload
    },
    loadOrganisations: (state, payload) => {
      state.organisations = payload
    },
    loadStudents: (state, payload) => {
      state.students = payload
    },
    loadSections: (state, payload) => {
      state.sections = payload
    },
    loadQuestions: (state, payload) => {
      const questions = []
      for (let i = 0; i < payload.length; i++) {
        const question = payload[i]
        question.answers = payload[i].answers.sort(function(a, b) {
          return a.order - b.order
        })
        questions.push(question)
      }
      state.questions = questions
    },
    updateTestInstance: (state, payload) => {
      state.testInstance = payload
    },
  },
  actions: {
    updateHost: ({ commit }, payload) => {
      commit('updateHost', payload)
    },
    updateCurrentTab: ({ commit }, payload) => {
      commit('updateCurrentTab', payload)
    },
    loadOrganisations: ({ commit }, payload) => {
      commit('loadOrganisations', payload)
    },
    loadStudents: ({ commit }, payload) => {
      commit('loadStudents', payload)
    },
    loadTests: ({ commit }, payload) => {
      commit('loadTests', payload)
    },
    loadSections: ({ commit }, payload) => {
      commit('loadSections', payload)
    },
    loadQuestions: ({ commit }, payload) => {
      commit('loadQuestions', payload)
    },
    updateTestInstance: ({ commit }, payload) => {
      commit('updateTestInstance', payload)
    }
  }
})
