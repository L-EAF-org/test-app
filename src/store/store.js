import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    host: false,
    showFacilitator: false,
    thisGame: 'L-EAF.org Test App',
    test: [],
    tests: [],
    sections: [],
    questions: []
  },
  getters: {
    getHost: (state) => {
      return state.host
    },
    getShowFacilitator: (state) => {
      return state.showFacilitator
    },
    getThisGame: (state) => {
      return state.thisGame
    },
    getTest: (state) => {
      return state.test
    },
    getTests: (state) => {
      return state.tests
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
    }
  },
  mutations: {
    updateHost: (state, payload) => {
      state.host = payload
    },
    updateShowFacilitator: (state, payload) => {
      state.showFacilitator = payload
    },
    loadTest: (state, payload) => {
      console.log(payload)
      state.test = payload
    },
    loadTests: (state, payload) => {
      state.tests = payload
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
    }
  },
  actions: {
    updateHost: ({ commit }, payload) => {
      commit('updateHost', payload)
    },
    updateShowFacilitator: ({ commit }, payload) => {
      commit('updateShowFacilitator', payload)
    },
    loadTest: ({ commit }, payload) => {
      commit('loadTest', payload)
    },
    loadTests: ({ commit }, payload) => {
      commit('loadTests', payload)
    },
    loadSections: ({ commit }, payload) => {
      commit('loadSections', payload)
    },
    loadQuestions: ({ commit }, payload) => {
      commit('loadQuestions', payload)
    }
  }
})
