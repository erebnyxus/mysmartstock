<template>
  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <q-fab
      icon="add"
      color="primary"
      direction="up"
    >
      <q-fab-action
        color="positive"
        icon="add_circle"
        label-position="left"
        external-label
        :label="$t('inventory.stockIn')"
        @click="openStockOperation('in')"
      />
      <q-fab-action
        color="negative"
        icon="remove_circle"
        label-position="left"
        external-label
        :label="$t('inventory.stockOut')"
        @click="openStockOperation('out')"
      />
      <q-fab-action
        color="secondary"
        icon="qr_code_scanner"
        label-position="left"
        external-label
        :label="$t('inventory.scanBarcode')"
        @click="openBarcodeScanner"
      />
    </q-fab>
    
    <!-- Global stock operation dialog -->
    <stock-operation-dialog
      v-model="showStockDialog"
      :operation-type="currentOperation"
      @operation-complete="onOperationComplete"
    />
  </q-page-sticky>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import StockOperationDialog from './inventory/StockOperationDialog.vue';

const $q = useQuasar();
const { t } = useI18n();

// State
const showStockDialog = ref(false);
const currentOperation = ref('in');

// Methods
const openStockOperation = (type) => {
  currentOperation.value = type;
  showStockDialog.value = true;
};

const onOperationComplete = () => {
  $q.notify({
    type: 'positive',
    message: t('inventory.operationSuccessful')
  });
};

const openBarcodeScanner = () => {
  // This would integrate with a barcode scanning library
  // For now, we'll just show a notification
  $q.notify({
    message: t('inventory.barcodeScannerNotImplemented'),
    color: 'info'
  });
};
</script>
