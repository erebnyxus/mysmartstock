<template>
  <div class="inventory-action-button">
    <!-- Desktop: Hover menu -->
    <q-btn-dropdown
      v-if="$q.screen.gt.sm"
      color="primary"
      :label="$t('actions')"
      icon="more_vert"
      flat
      auto-close
      class="desktop-action-button"
    >
      <q-list>
        <q-item clickable v-close-popup @click="openStockOperation('in')">
          <q-item-section avatar>
            <q-icon name="add_circle" color="positive" />
          </q-item-section>
          <q-item-section>{{ $t('stockIn') }}</q-item-section>
        </q-item>
        
        <q-item clickable v-close-popup @click="openStockOperation('out')">
          <q-item-section avatar>
            <q-icon name="remove_circle" color="negative" />
          </q-item-section>
          <q-item-section>{{ $t('stockOut') }}</q-item-section>
        </q-item>
        
        <q-item clickable v-close-popup @click="$emit('view-details')">
          <q-item-section avatar>
            <q-icon name="info" color="info" />
          </q-item-section>
          <q-item-section>{{ $t('viewDetails') }}</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    
    <!-- Mobile/Tablet: Click menu -->
    <q-btn
      v-else
      round
      flat
      icon="more_vert"
      color="primary"
      @click="showMobileActions = true"
    />
    
    <!-- Mobile action sheet -->
    <q-bottom-sheet v-model="showMobileActions" v-if="$q.screen.lt.md">
      <q-list>
        <q-item-label header>{{ $t('actions') }}</q-item-label>
        
        <q-item clickable v-close-popup @click="openStockOperation('in')">
          <q-item-section avatar>
            <q-icon name="add_circle" color="positive" />
          </q-item-section>
          <q-item-section>{{ $t('stockIn') }}</q-item-section>
        </q-item>
        
        <q-item clickable v-close-popup @click="openStockOperation('out')">
          <q-item-section avatar>
            <q-icon name="remove_circle" color="negative" />
          </q-item-section>
          <q-item-section>{{ $t('stockOut') }}</q-item-section>
        </q-item>
        
        <q-item clickable v-close-popup @click="$emit('view-details')">
          <q-item-section avatar>
            <q-icon name="info" color="info" />
          </q-item-section>
          <q-item-section>{{ $t('viewDetails') }}</q-item-section>
        </q-item>
      </q-list>
    </q-bottom-sheet>
    
    <!-- Stock operation dialog -->
    <stock-operation-dialog
      v-model="showStockDialog"
      :operation-type="currentOperation"
      :product="product"
      @operation-complete="onOperationComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import StockOperationDialog from './StockOperationDialog.vue';

const $q = useQuasar();

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

// Emits
const emit = defineEmits(['view-details', 'operation-complete']);

// State
const showMobileActions = ref(false);
const showStockDialog = ref(false);
const currentOperation = ref('in');

// Methods
const openStockOperation = (type) => {
  currentOperation.value = type;
  showStockDialog.value = true;
};

const onOperationComplete = (operationData) => {
  emit('operation-complete', operationData);
};
</script>

<style lang="sass" scoped>
.desktop-action-button
  .q-btn__content
    min-width: 70px
</style>
