<template>
  <q-footer bordered class="bg-white text-primary tablet-only">
    <q-tabs
      v-model="activeTab"
      class="text-primary"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-route-tab name="dashboard" to="/" icon="dashboard" :label="$t('dashboard')" />
      <q-route-tab name="products" to="/products" icon="inventory" :label="$t('products')" />
      <q-route-tab name="inventory" to="/inventory" icon="inventory_2" :label="$t('inventory.inventory')" />
      <q-route-tab name="reports" to="/reports" icon="bar_chart" :label="$t('reports')" />
      <q-route-tab name="settings" to="/settings" icon="settings" :label="$t('settings')" />
    </q-tabs>
  </q-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();

// Computed
const activeTab = computed(() => {
  const path = route.path;
  if (path === '/') return 'dashboard';
  if (path.startsWith('/products')) return 'products';
  if (path.startsWith('/inventory')) return 'inventory';
  if (path.startsWith('/reports')) return 'reports';
  if (path.startsWith('/settings')) return 'settings';
  return 'dashboard';
});
</script>

<style lang="sass" scoped>
.tablet-only
  @media (max-width: 599px), (min-width: 1024px)
    display: none
</style>
