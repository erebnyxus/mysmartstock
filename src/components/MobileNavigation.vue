<template>
  <q-footer bordered class="bg-white text-primary mobile-only">
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
      <q-route-tab name="more" icon="more_horiz" :label="$t('more')" @click="showMoreMenu = true" />
    </q-tabs>
    
    <!-- More menu -->
    <q-dialog v-model="showMoreMenu" position="bottom">
      <q-card style="width: 100%">
        <q-card-section>
          <div class="text-h6">{{ $t('more') }}</div>
        </q-card-section>
        
        <q-separator />
        
        <q-list>
          <q-item clickable v-close-popup to="/reports">
            <q-item-section avatar>
              <q-icon name="bar_chart" color="primary" />
            </q-item-section>
            <q-item-section>{{ $t('reports') }}</q-item-section>
          </q-item>
          
          <q-item clickable v-close-popup to="/settings">
            <q-item-section avatar>
              <q-icon name="settings" color="primary" />
            </q-item-section>
            <q-item-section>{{ $t('settings') }}</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </q-footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();

// State
const showMoreMenu = ref(false);

// Computed
const activeTab = computed(() => {
  const path = route.path;
  if (path === '/') return 'dashboard';
  if (path.startsWith('/products')) return 'products';
  if (path.startsWith('/inventory')) return 'inventory';
  if (path.startsWith('/reports') || path.startsWith('/settings')) return 'more';
  return 'dashboard';
});
</script>

<style lang="sass" scoped>
.mobile-only
  @media (min-width: 600px)
    display: none
</style>
