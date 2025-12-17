// the import below requires the following line
// to be added to `env.d.ts` to register the global
// typed in the IDE.
// otherwise, there will be an TS error.
//
// <reference types="unplugin-vue-router/client" />
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, _from) => {})

export default router
