<template>
  <div class="product-selector q-mb-md">
    <div class="text-subtitle1 q-mb-sm">{{ $t('selectProduct') }}</div>
    
    <q-select
      v-model="selectedProduct"
      :options="productOptions"
      option-value="id"
      option-label="name"
      :loading="loading"
      outlined
      use-input
      hide-selected
      fill-input
      input-debounce="300"
      @filter="filterProducts"
      @update:model-value="updateModelValue"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">
            {{ $t('noResults') }}
          </q-item-section>
        </q-item>
      </template>
      
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>{{ scope.opt.name }}</q-item-label>
            <q-item-label caption>{{ scope.opt.sku }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge color="primary" :label="scope.opt.currentStock" />
          </q-item-section>
        </q-item>
      </template>
      
      <template v-slot:append>
        <q-icon name="search" />
      </template>
    </q-select>
    
    <!-- Barcode scanner button for mobile -->
    <q-btn
      v-if="$q.platform.is.mobile"
      icon="qr_code_scanner"
      color="primary"
      flat
      class="q-mt-sm"
      @click="openBarcodeScanner"
    >
      {{ $t('scanBarcode') }}
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useProductStore } from 'src/stores/product-store';

const $q = useQuasar();
const { t } = useI18n();
const productStore = useProductStore();

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:modelValue']);

// State
const selectedProduct = ref(props.modelValue);
const productOptions = ref([]);
const loading = ref(false);

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  selectedProduct.value = newValue;
});

// Methods
const filterProducts = async (val, update) => {
  if (val === '') {
    update(() => {
      productOptions.value = productStore.products;
    });
    return;
  }

  loading.value = true;
  
  update(async () => {
    const needle = val.toLowerCase();
    productOptions.value = productStore.products.filter(
      v => v.name.toLowerCase().indexOf(needle) > -1 ||
           v.sku.toLowerCase().indexOf(needle) > -1
    );
    loading.value = false;
  });
};

const updateModelValue = () => {
  emit('update:modelValue', selectedProduct.value);
};

const openBarcodeScanner = async () => {
  // This would integrate with a barcode scanning library
  // For now, we'll just show a notification
  $q.notify({
    message: t('barcodeScannerNotImplemented'),
    color: 'info'
  });
};

// Initialize
(async () => {
  loading.value = true;
  await productStore.fetchAllProducts();
  productOptions.value = productStore.products;
  loading.value = false;
})();
</script>
