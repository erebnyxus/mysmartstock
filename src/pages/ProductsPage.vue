<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h5 class="q-mt-none q-mb-md">商品管理</h5>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="添加商品" :to="'/products/new'" />
      </div>
    </div>

    <q-card>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-4">
            <q-input
              v-model="searchText"
              placeholder="搜索商品..."
              outlined
              dense
              clearable
              debounce="300"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append v-if="searchText">
                <q-icon name="close" @click="searchText = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-select
              v-model="selectedCategory"
              :options="categoryOptions"
              outlined
              dense
              emit-value
              map-options
              label="按分类筛选"
              clearable
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="filteredProducts"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          v-model:pagination="pagination"
          :filter="searchText"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="name" :props="props">
                {{ props.row.name }}
              </q-td>
              <q-td key="sku" :props="props">
                {{ props.row.sku }}
              </q-td>
              <q-td key="category" :props="props">
                {{ getCategoryName(props.row.category_id) }}
              </q-td>
              <q-td key="inventory" :props="props">
                {{ getInventoryInfo(props.row.id) }}
              </q-td>
              <q-td key="actions" :props="props">
                <div class="q-gutter-sm">
                  <q-btn
                    size="sm"
                    icon="edit"
                    color="primary"
                    flat
                    dense
                    :to="`/products/edit/${props.row.id}`"
                  />
                  <q-btn
                    size="sm"
                    icon="delete"
                    color="negative"
                    flat
                    dense
                    @click="confirmDelete(props.row)"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey-8">
              <q-icon name="inventory" size="2em" class="q-mr-sm" />
              没有商品数据
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="deleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">您确定要删除这个商品吗？</span>
        </q-card-section>
        <q-card-section>
          <p>商品名称: {{ deleteTarget?.name }}</p>
          <p>SKU: {{ deleteTarget?.sku }}</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="删除" color="negative" @click="deleteProduct" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useProductStore } from '@/stores/product-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { Product } from '@/services/db/models';

const $q = useQuasar();
const productStore = useProductStore();
const inventoryStore = useInventoryStore();

const loading = ref(true);
const searchText = ref('');
const selectedCategory = ref(null);
const deleteDialog = ref(false);
const deleteTarget = ref<Product | null>(null);
const pagination = ref({
  sortBy: 'name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  { name: 'name', label: '商品名称', field: 'name', sortable: true, align: 'left' },
  { name: 'sku', label: 'SKU', field: 'sku', sortable: true, align: 'left' },
  { name: 'category', label: '分类', field: 'category_id', sortable: true, align: 'left' },
  { name: 'inventory', label: '库存', field: '', sortable: false, align: 'left' },
  { name: 'actions', label: '操作', field: '', sortable: false, align: 'center' }
];

// 分类选项
const categoryOptions = computed(() => {
  return [
    { label: '全部分类', value: null },
    ...productStore.categories.map(cat => ({
      label: cat.name,
      value: cat.id
    }))
  ];
});

// 根据搜索和分类筛选商品
const filteredProducts = computed(() => {
  let result = productStore.products;

  if (selectedCategory.value) {
    result = result.filter(p => p.category_id === selectedCategory.value);
  }

  pagination.value.rowsNumber = result.length;
  return result;
});

// 获取分类名称
const getCategoryName = (categoryId: string | undefined) => {
  if (!categoryId) return '未分类';
  const category = productStore.getCategoryById(categoryId);
  return category ? category.name : '未知分类';
};

// 获取库存信息
const getInventoryInfo = (productId: string | undefined) => {
  if (!productId) return '无库存信息';
  const inventory = inventoryStore.getInventoryByProductId(productId);
  if (!inventory) return '无库存';
  return `${inventory.quantity} ${inventory.unit}`;
};

// 确认删除
const confirmDelete = (product: Product) => {
  deleteTarget.value = product;
  deleteDialog.value = true;
};

// 执行删除
const deleteProduct = async () => {
  if (!deleteTarget.value?.id) return;
  
  try {
    await productStore.deleteProduct(deleteTarget.value.id);
    $q.notify({
      color: 'positive',
      message: `商品 ${deleteTarget.value.name} 已成功删除`,
      icon: 'check'
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: `删除失败: ${(error as Error).message}`,
      icon: 'warning'
    });
  }
};

// 页面加载时初始化数据
onMounted(async () => {
  try {
    await productStore.fetchAllProducts();
    await productStore.fetchAllCategories();
    await inventoryStore.fetchAllInventory();
  } catch (error) {
    console.error('加载商品数据失败:', error);
    $q.notify({
      color: 'negative',
      message: '加载商品数据失败',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
});
</script>