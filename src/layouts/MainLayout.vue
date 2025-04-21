<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          SmartStock
        </q-toolbar-title>

        <div>v{{ version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="260"
    >
      <q-list>
        <q-item-label header>SmartStock 菜单</q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-2 text-grey-8">
      <q-toolbar>
        <q-toolbar-title class="text-subtitle2">
          SmartStock &copy; {{ new Date().getFullYear() }}
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import { version } from '../../package.json';

const essentialLinks: EssentialLinkProps[] = [
  {
    title: '仪表盘',
    caption: '库存概览与统计',
    icon: 'dashboard',
    link: '/'
  },
  {
    title: '商品管理',
    caption: '添加和管理商品',
    icon: 'inventory',
    link: '/products'
  },
  {
    title: '库存管理',
    caption: '查看和调整库存',
    icon: 'inventory_2',
    link: '/inventory'
  },
  {
    title: '入库登记',
    caption: '记录入库操作',
    icon: 'add_shopping_cart',
    link: '/stock-in'
  },
  {
    title: '出库登记',
    caption: '记录出库操作',
    icon: 'shopping_cart_checkout',
    link: '/stock-out'
  },
  {
    title: '库存报表',
    caption: '生成库存报表',
    icon: 'bar_chart',
    link: '/reports'
  },
  {
    title: '系统设置',
    caption: '调整系统配置',
    icon: 'settings',
    link: '/settings'
  }
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
