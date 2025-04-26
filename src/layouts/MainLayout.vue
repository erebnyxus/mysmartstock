<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Responsive Header -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <!-- Menu button - only visible on desktop and tablet in portrait -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          :class="{ 'desktop-only': $q.screen.lt.md && $q.screen.width > $q.screen.height }"
        />

        <!-- App title -->
        <q-toolbar-title> SmartStock </q-toolbar-title>

        <!-- Version info -->
        <div class="desktop-only">v{{ version }}</div>

        <!-- Search button - only on mobile -->
        <q-btn
          flat
          dense
          round
          icon="search"
          aria-label="Search"
          class="mobile-only"
          @click="showSearch = true"
        />
      </q-toolbar>

      <!-- Mobile search bar -->
      <q-slide-transition>
        <div v-show="showSearch" class="mobile-only">
          <q-toolbar>
            <q-input
              v-model="searchText"
              dense
              outlined
              placeholder="搜索..."
              class="full-width"
              bg-color="white"
              dark
            >
              <template v-slot:append>
                <q-icon name="close" @click="showSearch = false" class="cursor-pointer" />
              </template>
            </q-input>
          </q-toolbar>
        </div>
      </q-slide-transition>
    </q-header>

    <!-- Desktop/Tablet Side Navigation -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="260"
      :breakpoint="1024"
      class="desktop-drawer"
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item-label header>SmartStock 菜单</q-item-label>

          <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Main Content Area -->
    <q-page-container class="content-padding">
      <router-view />

      <!-- Floating Action Button for quick actions -->
      <ResponsiveFab />
    </q-page-container>

    <!-- Desktop Footer - only visible on desktop -->
    <q-footer elevated class="bg-grey-2 text-grey-8 desktop-only">
      <q-toolbar>
        <q-toolbar-title class="text-subtitle2">
          SmartStock &copy; {{ new Date().getFullYear() }}
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>

    <!-- Mobile Navigation - only visible on mobile -->
    <MobileNavigation />

    <!-- Tablet Navigation - only visible on tablet -->
    <TabletNavigation />
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import EssentialLink from 'components/EssentialLink.vue';
import MobileNavigation from 'src/components/MobileNavigation.vue';
import TabletNavigation from 'src/components/TabletNavigation.vue';
import ResponsiveFab from 'src/components/ResponsiveFab.vue';
import { version } from '../../package.json';

// Define the EssentialLinkProps interface
interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
}

// Initialize Quasar
const $q = useQuasar();

// State variables
const leftDrawerOpen = ref(false);
const showSearch = ref(false);
const searchText = ref('');

// Navigation links
const essentialLinks: EssentialLinkProps[] = [
  {
    title: '仪表盘',
    caption: '库存概览与统计',
    icon: 'dashboard',
    link: '/',
  },
  {
    title: '商品管理',
    caption: '添加和管理商品',
    icon: 'inventory',
    link: '/products',
  },
  {
    title: '库存管理',
    caption: '查看和调整库存',
    icon: 'inventory_2',
    link: '/inventory',
  },
  {
    title: '入库登记',
    caption: '记录入库操作',
    icon: 'add_shopping_cart',
    link: '/stock-in',
  },
  {
    title: '出库登记',
    caption: '记录出库操作',
    icon: 'shopping_cart_checkout',
    link: '/stock-out',
  },
  {
    title: '库存报表',
    caption: '生成库存报表',
    icon: 'bar_chart',
    link: '/reports',
  },
  {
    title: '系统设置',
    caption: '调整系统配置',
    icon: 'settings',
    link: '/settings',
  },
];

// Toggle the left drawer
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style lang="sass" scoped>
// Responsive layout adjustments
.desktop-drawer
  @media (max-width: 599px)
    display: none

// Add padding to the bottom of the page container on mobile
// to account for the bottom navigation bar
.q-page-container
  @media (max-width: 1023px)
    padding-bottom: 56px

// Ensure the content has proper padding
.content-padding
  padding: 8px
  @media (min-width: 600px)
    padding: 16px
  @media (min-width: 1024px)
    padding: 24px

// Mobile-specific styles
.mobile-only
  @media (min-width: 600px)
    display: none

// Desktop-specific styles
.desktop-only
  @media (max-width: 1023px)
    display: none

// Tablet-specific styles
.tablet-only
  @media (max-width: 599px), (min-width: 1024px)
    display: none
</style>
