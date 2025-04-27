<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useProductStore } from './stores/product-store';
import { useInventoryStore } from './stores/inventory-store';
import { db } from './services/db';

// Get store instances
const productStore = useProductStore();
const inventoryStore = useInventoryStore();

// Initialize data when the application is mounted
onMounted(async () => {
  try {
    console.log('Initializing SmartStock application...');

    // Initialize the database and default data
    await db.initializeDefaultData();

    // Preload main data
    await Promise.all([
      productStore.fetchAllProducts(),
      productStore.fetchAllCategories(),
      inventoryStore.fetchAllInventory(),
    ]);

    // Merge product and inventory data for display
    await inventoryStore.fetchInventoryWithProducts();

    console.log('SmartStock application initialized successfully');
  } catch (error) {
    console.error('Application initialization failed:', error);
  }
});
</script>
