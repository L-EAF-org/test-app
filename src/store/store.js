import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    host: false,
    showFacilitator: false,
    thisGame: 'L-EAF.org Test App',
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
    getTests: (state) => {
      return state.tests
    },
    getSections: (state) => {
      return state.sections
    },
    getQuestions: (state) => {
      return state.questions
    }
  },
  mutations: {
    updateHost: (state, payload) => {
      state.host = payload
    },
    updateShowFacilitator: (state, payload) => {
      state.showFacilitator = payload
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
        questions.push(payload[i].question)
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
