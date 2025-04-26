<template>
  <div class="quantity-input q-mb-md">
    <div class="text-subtitle1 q-mb-sm">{{ $t('quantity') }}</div>
    
    <div class="row items-center">
      <div class="col-12 col-sm-6">
        <q-input
          v-model.number="quantityValue"
          type="number"
          :min="min"
          :max="max"
          outlined
          :rules="[
            val => val !== null && val !== '' || $t('fieldRequired'),
            val => val > 0 || $t('mustBePositive'),
            val => !max || val <= max || $t('exceedsAvailableStock')
          ]"
        >
          <template v-slot:prepend>
            <q-btn
              round
              flat
              icon="remove"
              @click="decrementQuantity"
              :disable="quantityValue <= min"
            />
          </template>
          
          <template v-slot:append>
            <q-btn
              round
              flat
              icon="add"
              @click="incrementQuantity"
              :disable="max !== undefined && quantityValue >= max"
            />
          </template>
        </q-input>
      </div>
      
      <div v-if="max !== undefined" class="col-12 col-sm-6 q-pl-sm-md q-mt-xs q-mt-sm-0">
        <div class="text-caption">
          {{ $t('availableStock') }}: <span class="text-weight-bold">{{ max }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  min: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    default: undefined
  }
});

// Emits
const emit = defineEmits(['update:modelValue']);

// State
const quantityValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Methods
const incrementQuantity = () => {
  if (props.max === undefined || quantityValue.value < props.max) {
    quantityValue.value++;
  }
};

const decrementQuantity = () => {
  if (quantityValue.value > props.min) {
    quantityValue.value--;
  }
};

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  // Ensure quantity is within bounds when props change
  if (newValue < props.min) {
    emit('update:modelValue', props.min);
  } else if (props.max !== undefined && newValue > props.max) {
    emit('update:modelValue', props.max);
  }
});
</script>
