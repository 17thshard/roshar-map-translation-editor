import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Locale from '@/views/Locale.vue'
import LocaleStatistics from '@/views/LocaleStatistics.vue'
import EntryList from '@/views/EntryList.vue'
import StandardEntryEditor from '@/views/StandardEntryEditor.vue'
import EventEditor from '@/views/EventEditor.vue'
import store from '@/store'
import MessageList from '@/views/MessageList.vue'
import MessageEditor from '@/views/MessageEditor.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      hideSidebar: true,
      hideHeader: true
    }
  },
  {
    path: '/locales/:locale',
    component: Locale,
    children: [
      {
        path: '/',
        name: 'locale.statistics',
        component: LocaleStatistics
      },
      {
        path: 'messages',
        name: 'locale.messages',
        component: MessageList,
        children: [
          {
            path: ':path',
            name: 'locale.messages.edit',
            component: MessageEditor,
            meta: {
              toolbar: true
            }
          }
        ],
        meta: {
          toolbar: true
        }
      },
      {
        path: 'events',
        name: 'locale.events',
        component: EntryList,
        props: {
          type: 'events',
          title: 'Events'
        },
        children: [
          {
            path: ':id',
            name: 'locale.events.edit',
            component: EventEditor,
            meta: {
              toolbar: true
            }
          }
        ]
      },
      {
        path: 'locations',
        name: 'locale.locations',
        component: EntryList,
        props: {
          type: 'locations',
          title: 'Locations'
        },
        children: [
          {
            path: ':id',
            name: 'locale.locations.edit',
            component: StandardEntryEditor,
            meta: {
              toolbar: true
            }
          }
        ]
      },
      {
        path: 'characters',
        name: 'locale.characters',
        component: EntryList,
        props: {
          type: 'characters',
          title: 'Characters'
        },
        children: [
          {
            path: ':id',
            name: 'locale.characters.edit',
            component: StandardEntryEditor,
            meta: {
              toolbar: true
            }
          }
        ]
      },
      {
        path: 'misc',
        name: 'locale.misc',
        component: EntryList,
        props: {
          type: 'misc',
          title: 'Miscellaneous'
        },
        children: [
          {
            path: ':id',
            name: 'locale.misc.edit',
            component: StandardEntryEditor,
            meta: {
              toolbar: true
            }
          }
        ]
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (store.state.dirtyHandler === null) {
    next()
    return
  }

  store.state.dirtyHandler(to, from, next)
})

export default router
