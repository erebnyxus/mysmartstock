<template>
  <q-dialog
    v-model="isOpen"
    :full-width="$q.screen.lt.sm"
    :full-height="$q.screen.lt.sm"
    :maximized="$q.screen.lt.sm"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="stock-operation-dialog">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ operationTitle }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <!-- Multi-step form for mobile, single form for tablet/desktop -->
        <q-stepper
          v-if="$q.screen.lt.sm"
          v-model="step"
          vertical
          color="primary"
          animated
        >
          <!-- Product Selection Step -->
          <q-step name="product" :title="$t('selectProduct')" icon="inventory_2">
            <product-selector v-model="selectedProduct" />
            <q-stepper-navigation>
              <q-btn
                :disable="!selectedProduct"
                color="primary"
                @click="step = 'details'"
                :label="$t('continue')"
              />
            </q-stepper-navigation>
          </q-step>

          <!-- Quantity and Details Step -->
          <q-step name="details" :title="$t('enterDetails')" icon="edit">
            <quantity-input
              v-model="quantity"
              :max="operationType === 'out' ? selectedProduct?.currentStock : undefined"
              :min="1"
            />
            <notes-input v-model="notes" />
            <q-stepper-navigation>
              <q-btn color="primary" @click="submitOperation" :label="$t('confirm')" />
              <q-btn flat @click="step = 'product'" :label="$t('back')" class="q-ml-sm" />
            </q-stepper-navigation>
          </q-step>

          <!-- Confirmation Step -->
          <q-step name="confirmation" :title="$t('confirmation')" icon="check_circle">
            <div class="text-center q-pa-md">
              <q-icon name="check_circle" color="positive" size="4rem" />
              <div class="text-h6 q-mt-md">{{ $t('operationSuccessful') }}</div>
              <div class="q-mt-sm">{{ operationSuccessMessage }}</div>
            </div>
            <q-stepper-navigation>
              <q-btn color="primary" v-close-popup :label="$t('done')" />
              <q-btn flat @click="resetAndAddAnother" :label="$t('addAnother')" class="q-ml-sm" />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>

        <!-- Single form for tablet/desktop -->
        <template v-else>
          <div v-if="step !== 'confirmation'">
            <q-form @submit="submitOperation" class="q-gutter-md">
              <product-selector 
                v-if="!preSelectedProduct" 
                v-model="selectedProduct" 
              />
              
              <div v-else class="row q-mb-md">
                <div class="col-12">
                  <div class="text-subtitle1">{{ $t('product') }}</div>
                  <div class="text-h6">{{ selectedProduct.name }}</div>
                  <div class="text-caption">{{ selectedProduct.sku }}</div>
                </div>
              </div>
              
              <quantity-input
                v-model="quantity"
                :max="operationType === 'out' ? selectedProduct?.currentStock : undefined"
                :min="1"
              />
              
              <notes-input v-model="notes" />
              
              <div class="row justify-end q-mt-md">
                <q-btn type="submit" color="primary" :label="$t('confirm')" />
              </div>
            </q-form>
          </div>
          
          <div v-else class="text-center q-pa-md">
            <q-icon name="check_circle" color="positive" size="4rem" />
            <div class="text-h6 q-mt-md">{{ $t('operationSuccessful') }}</div>
            <div class="q-mt-sm">{{ operationSuccessMessage }}</div>
            <div class="row justify-center q-mt-lg">
              <q-btn color="primary" v-close-popup :label="$t('done')" class="q-mr-sm" />
              <q-btn outline color="primary" @click="resetAndAddAnother" :label="$t('addAnother')" />
            </div>
          </div>
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import ProductSelector from './ProductSelector.vue';
import QuantityInput from './QuantityInput.vue';
import NotesInput from './NotesInput.vue';
import { useInventoryStore } from 'src/stores/inventory-store';

const $q = useQuasar();
const { t } = useI18n();
const inventoryStore = useInventoryStore();

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  operationType: {
    type: String,
    default: 'in',
    validator: (value: string) => ['in', 'out'].includes(value)
  },
  product: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'operation-complete']);

// State
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
const step = ref('product');
const selectedProduct = ref(props.product || null);
const preSelectedProduct = computed(() => !!props.product);
const quantity = ref(1);
const notes = ref('');
const loading = ref(false);

// Computed
const operationTitle = computed(() => {
  return props.operationType === 'in' 
    ? t('stockInOperation') 
    : t('stockOutOperation');
});

const operationSuccessMessage = computed(() => {
  if (props.operationType === 'in') {
    return t('stockInSuccessMessage', {
      quantity: quantity.value,
      product: selectedProduct.value?.name
    });
  } else {
    return t('stockOutSuccessMessage', {
      quantity: quantity.value,
      product: selectedProduct.value?.name
    });
  }
});

// Watch for prop changes
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    selectedProduct.value = newProduct;
    // If product is pre-selected, skip to details step
    if ($q.screen.lt.sm) {
      step.value = 'details';
    }
  }
});

// Methods
const submitOperation = async () => {
  if (!selectedProduct.value || quantity.value <= 0) {
    return;
  }

  loading.value = true;
  
  try {
    if (props.operationType === 'in') {
      await inventoryStore.addStock({
        productId: selectedProduct.value.id,
        quantity: quantity.value,
        notes: notes.value
      });
    } else {
      await inventoryStore.removeStock({
        productId: selectedProduct.value.id,
        quantity: quantity.value,
        notes: notes.value
      });
    }
    
    // Show success step
    step.value = 'confirmation';
    
    // Emit operation complete
    emit('operation-complete', {
      type: props.operationType,
      product: selectedProduct.value,
      quantity: quantity.value
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: t('operationFailed'),
      caption: error.message
    });
  } finally {
    loading.value = false;
  }
};

const resetAndAddAnother = () => {
  // Reset form
  quantity.value = 1;
  notes.value = '';
  
  if (!preSelectedProduct.value) {
    selectedProduct.value = null;
  }
  
  // Go back to first step
  step.value = preSelectedProduct.value ? 'details' : 'product';
};

// Initialize
onMounted(() => {
  // If product is pre-selected, skip to details step
  if (props.product && $q.screen.lt.sm) {
    step.value = 'details';
  }
});
</script>

<style lang="sass" scoped>
.stock-operation-dialog
  width: 100%
  max-width: 500px
  @media (max-width: 599px)
    max-width: 100%
</style>
