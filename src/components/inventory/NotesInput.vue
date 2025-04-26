<template>
  <div class="notes-input q-mb-md">
    <div class="text-subtitle1 q-mb-sm">{{ $t('notes') }}</div>
    
    <q-input
      v-model="notesValue"
      type="textarea"
      outlined
      :placeholder="$t('notesPlaceholder')"
      rows="3"
      autogrow
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

// Emits
const emit = defineEmits(['update:modelValue']);

// State
const notesValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>
