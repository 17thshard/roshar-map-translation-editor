import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    locales: window.loadLocales(),
    reference: window.loadReference(),
    referenceMessages: window.loadReferenceMessages(),
    messageComments: window.loadMessageComments(),
    dirtyHandler: null
  },
  mutations: {
    reloadReference (state) {
      state.reference = window.loadReference()
      state.referenceMessages = window.loadReferenceMessages()
    },
    reloadLocales (state) {
      state.locales = window.loadLocales()
    },
    setDirtyHandler (state, handler) {
      state.dirtyHandler = handler
    },
    removeDirtyHandler (state) {
      state.dirtyHandler = null
    }
  },
  actions: {},
  modules: {}
})
