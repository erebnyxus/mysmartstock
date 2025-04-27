<!-- filepath: c:\Users\nblhn\OneDrive\Desktop\mysmartstock\src\pages\ProductDetailPage.vue -->
<template>
  <div class="product-detail-page">
    <h1>Product Details</h1>
    <p>Details for product with ID: {{ id }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const id = ref(route.params.id);
</script>

<style scoped>
.product-detail-page {
  padding: 16px;
}
</style>
