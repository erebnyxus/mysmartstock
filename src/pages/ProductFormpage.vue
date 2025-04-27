<!-- filepath: c:\Users\nblhn\OneDrive\Desktop\mysmartstock\src\pages\ProductFormPage.vue -->
<template>
  <div class="product-form-page">
    <h1>Product Form</h1>
    <p v-if="id">Editing product with ID: {{ id }}</p>
    <p v-else>Creating a new product</p>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="name">Product Name:</label>
        <input id="name" v-model="form.name" type="text" required />
      </div>
      <div>
        <label for="price">Price:</label>
        <input id="price" v-model="form.price" type="number" required />
      </div>
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const id = ref(route.params.id);

const form = ref({
  name: '',
  price: 0,
});

const handleSubmit = () => {
  if (id.value) {
    console.log(`Updating product with ID: ${id.value}`, form.value);
  } else {
    console.log('Creating new product', form.value);
  }
};
</script>

<style scoped>
.product-form-page {
  padding: 16px;
}

form div {
  margin-bottom: 8px;
}
</style>
