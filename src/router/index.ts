import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";
import HelloWorldVue from "../components/HelloWorld.vue";
import NotFound from '@/views/notfound/index.vue'

const routes: Readonly<RouteRecordRaw[]> = [
    {
        path: '/',
        name: 'home',
        component: HelloWorldVue
    },
    {
        path: '/birds',
        name: 'Birds',
        component: () => import('@/views/birds/index.vue')
    },
    {
        path: '/game',
        name: 'Game',
        component: () => import('@/views/game/index.vue')
    },
    {
        path: '/map',
        name: 'Map',
        component: () => import('@/views/map/index.vue')
    },
    {
        path: '/example',
        name: 'Examples',
        children: [
            {
                path: '/example/first',
                name: 'FirstExample',
                component: () => import('@/views/example/first/index.vue'),
            }
        ]
    },
    {
        path: '/dataScreen',
        name: 'dataScreen',
        component: () => import('@/views/dataScreen/index.vue')
    },
    {
        path: '/tres',
        name: 'tres',
        component: () => import('@/views/tres/index.vue')
    },
    {
        path: '/:catchAll(.*)',
        name: 'NotFound',
        component: NotFound
    },
]

export default createRouter({
    history: createWebHistory(),
    routes
})