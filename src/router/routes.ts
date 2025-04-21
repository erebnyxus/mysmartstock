import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue') },
      { path: 'products', component: () => import('pages/ProductsPage.vue') },
      { path: 'products/new', component: () => import('pages/ProductFormPage.vue') },
      { path: 'products/edit/:id', component: () => import('pages/ProductFormPage.vue') },
      { path: 'inventory', component: () => import('pages/InventoryPage.vue') },
      { path: 'stock-in', component: () => import('pages/StockInPage.vue') },
      { path: 'stock-out', component: () => import('pages/StockOutPage.vue') },
      { path: 'reports', component: () => import('pages/ReportsPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
