import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
      },
      {
        path: 'products',
        name: 'products',
        component: () => import('@/pages/ProductsPage.vue'),
      },
      {
        path: 'product/:id',
        name: 'product-details',
        component: () => import('@/pages/ProductDetailPage.vue'),
        props: true,
      },
      {
        path: 'product-form/:id?',
        name: 'product-form',
        component: () => import('@/pages/ProductFormPage.vue'),
        props: true,
      },
      {
        path: 'inventory',
        name: 'inventory',
        component: () => import('@/pages/InventoryPage.vue'),
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/pages/ReportsPage.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/pages/SettingsPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
];

export default routes;
