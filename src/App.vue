<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useProductStore } from './stores/product-store';
import { useInventoryStore } from './stores/inventory-store';
import { db } from './services/db';

// 获取存储实例
const productStore = useProductStore();
const inventoryStore = useInventoryStore();

// 在应用挂载时初始化数据
onMounted(async () => {
  try {
    console.log('初始化SmartStock应用...');
    
    // 初始化数据库和默认数据
    await db.initializeDefaultData();
    
    // 预加载主要数据
    await Promise.all([
      productStore.fetchAllProducts(),
      productStore.fetchAllCategories(),
      inventoryStore.fetchAllInventory()
    ]);
    
    // 合并产品和库存数据以供显示
    await inventoryStore.fetchInventoryWithProducts();
    
    console.log('SmartStock应用初始化完成');
  } catch (error) {
    console.error('应用初始化失败:', error);
  }
});
</script>
