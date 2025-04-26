<template>
  <q-page class="dashboard-page q-pa-responsive">
    <div class="text-h5 q-mb-md">{{ $t('dashboard') }}</div>
    
    <div class="row q-col-gutter-md">
      <!-- Placeholder for dashboard content -->
      <div class="col-12 col-md-6 col-lg-4">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6">{{ $t('inventory.inventory') }}</div>
          </q-card-section>
          
          <q-card-section>
            <q-btn 
              color="primary" 
              :label="$t('inventory.inventory')" 
              to="/inventory" 
              class="full-width"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style lang="sass" scoped>
.dashboard-page
  .dashboard-card
    height: 100%
</style>
