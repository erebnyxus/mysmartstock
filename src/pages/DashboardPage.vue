<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- 欢迎卡片 -->
      <div class="col-12">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h6">欢迎使用 SmartStock</div>
            <div class="text-subtitle2">智能库存管理系统</div>
          </q-card-section>
          <q-card-section>
            <p>当前日期: {{ currentDate }}</p>
          </q-card-section>
        </q-card>
      </div>

      <!-- 库存概览统计卡片 -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="bg-positive text-white">
            <div class="text-h6">库存总览</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label caption>商品总数</q-item-label>
                  <q-item-label class="text-h5">{{ stats.totalProducts }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>库存总数量</q-item-label>
                  <q-item-label class="text-h5">{{ stats.totalItems }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>库存总价值</q-item-label>
                  <q-item-label class="text-h5">{{
                    formatCurrency(stats.totalValue)
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- 低库存预警卡片 -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="bg-warning text-white">
            <div class="text-h6">低库存预警</div>
          </q-card-section>
          <q-card-section v-if="lowStockItems.length > 0">
            <q-list separator>
              <q-item
                v-for="item in lowStockItems"
                :key="item.id"
                clickable
                :to="`/inventory?id=${item.id}`"
              >
                <q-item-section avatar>
                  <q-avatar color="warning" text-color="white">
                    {{ item.quantity }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.product_name }}</q-item-label>
                  <q-item-label caption>
                    库存: {{ item.quantity }} {{ item.unit }} (最低: {{ item.min_quantity }})
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="warning" color="warning" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section v-else class="text-center">
            <q-icon name="check_circle" color="positive" size="3rem" />
            <p>没有低库存商品</p>
          </q-card-section>
        </q-card>
      </div>

      <!-- 缺货商品卡片 -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="bg-negative text-white">
            <div class="text-h6">缺货商品</div>
          </q-card-section>
          <q-card-section v-if="outOfStockItems.length > 0">
            <q-list separator>
              <q-item
                v-for="item in outOfStockItems"
                :key="item.id"
                clickable
                :to="`/inventory?id=${item.id}`"
              >
                <q-item-section avatar>
                  <q-avatar color="negative" text-color="white"> 0 </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.product_name }}</q-item-label>
                  <q-item-label caption> SKU: {{ item.product_sku }} </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    color="red"
                    icon="shopping_cart"
                    :to="`/stock-in?product=${item.id}`"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section v-else class="text-center">
            <q-icon name="check_circle" color="positive" size="3rem" />
            <p>没有缺货商品</p>
          </q-card-section>
        </q-card>
      </div>

      <!-- 最近活动记录 -->
      <div class="col-12">
        <q-card>
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">最近库存活动</div>
          </q-card-section>
          <q-card-section v-if="recentTransactions.length > 0">
            <q-list separator>
              <q-item v-for="transaction in recentTransactions" :key="transaction.id!">
                <q-item-section avatar>
                  <q-avatar :color="getTransactionColor(transaction.type)" text-color="white">
                    <q-icon :name="getTransactionIcon(transaction.type)" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ getTransactionTypeName(transaction.type) }}:
                    {{ getProductName(transaction.product_id) }}
                  </q-item-label>
                  <q-item-label caption>
                    数量: {{ transaction.before_quantity }} → {{ transaction.after_quantity }} ({{
                      transaction.type === 'in' ? '+' : transaction.type === 'out' ? '-' : ''
                    }}{{ transaction.quantity }})
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  {{ formatDate(transaction.date) }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-section v-else class="text-center">
            <p>暂无库存活动记录</p>
          </q-card-section>
        </q-card>
      </div>

      <!-- 快速操作按钮 -->
      <div class="col-12 q-gutter-md">
        <q-btn color="primary" icon="add_shopping_cart" label="入库登记" to="/stock-in" />
        <q-btn color="secondary" icon="shopping_cart_checkout" label="出库登记" to="/stock-out" />
        <q-btn color="accent" icon="inventory" label="新增商品" to="/products/new" />
      </div>
    </div>

    <!-- 加载状态 -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '@/stores/product-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { db } from '@/services/db';
import type { InventoryTransaction } from '@/services/db/models';

const productStore = useProductStore();
const inventoryStore = useInventoryStore();
const loading = ref(true);
const recentTransactions = ref<InventoryTransaction[]>([]);
const currentDate = new Date().toLocaleDateString('zh-CN');

// 页面统计数据
const stats = computed(() => {
  return {
    totalProducts: productStore.products.length,
    totalItems: inventoryStore.inventory.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: inventoryStore.getTotalInventoryValue,
  };
});

const lowStockItems = computed(() => {
  return inventoryStore.lowStockItems.slice(0, 5); // 只显示前5个低库存商品
});

const outOfStockItems = computed(() => {
  return inventoryStore.outOfStockItems.slice(0, 5); // 只显示前5个缺货商品
});

// 根据交易类型获取图标
const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'in':
      return 'add_shopping_cart';
    case 'out':
      return 'shopping_cart_checkout';
    case 'adjust':
      return 'tune';
    default:
      return 'help';
  }
};

// 根据交易类型获取颜色
const getTransactionColor = (type: string) => {
  switch (type) {
    case 'in':
      return 'positive';
    case 'out':
      return 'negative';
    case 'adjust':
      return 'blue';
    default:
      return 'grey';
  }
};

// 根据交易类型获取名称
const getTransactionTypeName = (type: string) => {
  switch (type) {
    case 'in':
      return '入库';
    case 'out':
      return '出库';
    case 'adjust':
      return '调整';
    default:
      return '未知';
  }
};

// 格式化货币
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(value);
};

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 获取产品名称
const getProductName = (productId: string) => {
  const product = productStore.getProductById(productId);
  return product ? product.name : '未知商品';
};

// 页面加载时初始化数据
onMounted(async () => {
  try {
    // 确保数据库已初始化
    await db.initializeDefaultData();

    // 加载产品数据
    await productStore.fetchAllProducts();
    await productStore.fetchAllCategories();

    // 加载库存数据
    await inventoryStore.fetchAllInventory();
    await inventoryStore.fetchInventoryWithProducts();

    // 获取最近的库存操作记录
    recentTransactions.value = await db.transactions.orderBy('date').reverse().limit(10).toArray();
  } catch (error) {
    console.error('初始化仪表盘数据失败:', error);
  } finally {
    loading.value = false;
  }
});
</script>
