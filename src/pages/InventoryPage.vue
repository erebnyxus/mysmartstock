<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h5 class="q-mt-none q-mb-md">库存管理</h5>
      </div>
      <div class="col-auto">
        <div class="q-gutter-sm">
          <q-btn color="positive" icon="add_shopping_cart" label="入库" :to="'/stock-in'" />
          <q-btn color="warning" icon="shopping_cart_checkout" label="出库" :to="'/stock-out'" />
        </div>
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
              v-model="filterStatus"
              :options="statusOptions"
              outlined
              dense
              emit-value
              map-options
              label="库存状态"
              clearable
            />
          </div>
          <div class="col-12 col-sm-6 col-md-4">
            <q-select
              v-model="selectedCategory"
              :options="categoryOptions"
              outlined
              dense
              emit-value
              map-options
              label="商品分类"
              clearable
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          :rows="filteredInventory"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          v-model:pagination="pagination"
          :filter="searchText"
        >
          <template v-slot:body="props">
            <q-tr :props="props" :class="getRowClass(props.row.status)">
              <q-td key="product_name" :props="props">
                {{ props.row.product_name }}
              </q-td>
              <q-td key="product_sku" :props="props">
                {{ props.row.product_sku }}
              </q-td>
              <q-td key="category_name" :props="props">
                {{ props.row.category_name || '未分类' }}
              </q-td>
              <q-td key="quantity" :props="props">
                <q-badge :color="getQuantityColor(props.row)" outline>
                  {{ props.row.quantity }} {{ props.row.unit }}
                </q-badge>
                <div class="text-caption q-mt-xs" v-if="props.row.min_quantity">
                  最低库存: {{ props.row.min_quantity }}
                </div>
              </q-td>
              <q-td key="location" :props="props">
                {{ props.row.location || '无' }}
              </q-td>
              <q-td key="value" :props="props">
                {{ formatCurrency(props.row.cost_price * props.row.quantity) }}
              </q-td>
              <q-td key="actions" :props="props">
                <div class="q-gutter-sm">
                  <q-btn
                    size="sm"
                    icon="add"
                    color="positive"
                    flat
                    dense
                    :to="`/stock-in?product=${props.row.id}`"
                  />
                  <q-btn
                    size="sm"
                    icon="remove"
                    color="negative"
                    flat
                    dense
                    :to="`/stock-out?product=${props.row.id}`"
                  />
                  <q-btn
                    size="sm"
                    icon="edit"
                    color="primary"
                    flat
                    dense
                    @click="openAdjustDialog(props.row)"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey-8">
              <q-icon name="inventory_2" size="2em" class="q-mr-sm" />
              没有库存数据
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 调整库存对话框 -->
    <q-dialog v-model="adjustDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <div class="text-h6">调整库存</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p>商品: {{ selectedItem?.product_name }}</p>
          <p>当前库存: {{ selectedItem?.quantity }} {{ selectedItem?.unit }}</p>
          
          <q-input
            v-model.number="adjustedQuantity"
            type="number"
            label="新库存数量"
            outlined
            dense
          />
          
          <q-input
            v-model="adjustmentNote"
            label="调整备注"
            outlined
            dense
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="保存" color="primary" @click="saveAdjustment" :loading="saving" />
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
import { InventoryWithProduct } from '@/services/db/models';

const $q = useQuasar();
const productStore = useProductStore();
const inventoryStore = useInventoryStore();

const loading = ref(true);
const searchText = ref('');
const selectedCategory = ref(null);
const filterStatus = ref(null);
const adjustDialog = ref(false);
const selectedItem = ref<InventoryWithProduct | null>(null);
const adjustedQuantity = ref(0);
const adjustmentNote = ref('');
const saving = ref(false);

const pagination = ref({
  sortBy: 'product_name',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

const columns = [
  { name: 'product_name', label: '商品名称', field: 'product_name', sortable: true, align: 'left' },
  { name: 'product_sku', label: 'SKU', field: 'product_sku', sortable: true, align: 'left' },
  { name: 'category_name', label: '分类', field: 'category_name', sortable: true, align: 'left' },
  { name: 'quantity', label: '库存数量', field: 'quantity', sortable: true, align: 'left' },
  { name: 'location', label: '存放位置', field: 'location', sortable: true, align: 'left' },
  { name: 'value', label: '库存价值', field: 'cost_price', sortable: true, align: 'left' },
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

// 状态选项
const statusOptions = [
  { label: '全部状态', value: null },
  { label: '库存正常', value: 'normal' },
  { label: '库存偏低', value: 'low' },
  { label: '缺货', value: 'out' }
];

// 根据条件筛选库存
const filteredInventory = computed(() => {
  let result = inventoryStore.inventoryWithProducts;

  if (selectedCategory.value) {
    result = result.filter(item => {
      const product = productStore.getProductById(item.id);
      return product && product.category_id === selectedCategory.value;
    });
  }

  if (filterStatus.value) {
    result = result.filter(item => item.status === filterStatus.value);
  }

  pagination.value.rowsNumber = result.length;
  return result;
});

// 获取库存状态对应的行样式
const getRowClass = (status: string) => {
  switch (status) {
    case 'low': return 'bg-yellow-1';
    case 'out': return 'bg-red-1';
    default: return '';
  }
};

// 获取数量对应的徽章颜色
const getQuantityColor = (item: InventoryWithProduct) => {
  switch (item.status) {
    case 'low': return 'warning';
    case 'out': return 'negative';
    default: return 'positive';
  }
};

// 格式化货币
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(value || 0);
};

// 打开调整库存对话框
const openAdjustDialog = (item: InventoryWithProduct) => {
  selectedItem.value = item;
  adjustedQuantity.value = item.quantity;
  adjustmentNote.value = '';
  adjustDialog.value = true;
};

// 保存库存调整
const saveAdjustment = async () => {
  if (!selectedItem.value) return;
  
  saving.value = true;
  try {
    // 记录库存调整
    await inventoryStore.recordTransaction({
      product_id: selectedItem.value.id,
      type: 'adjust',
      quantity: adjustedQuantity.value,
      notes: adjustmentNote.value,
      operator: 'admin'
    });
    
    $q.notify({
      color: 'positive',
      message: `库存调整成功`,
      icon: 'check'
    });
    
    // 关闭对话框
    adjustDialog.value = false;
    
    // 刷新库存数据
    await inventoryStore.fetchInventoryWithProducts();
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: `调整失败: ${(error as Error).message}`,
      icon: 'warning'
    });
  } finally {
    saving.value = false;
  }
};

// 页面加载时初始化数据
onMounted(async () => {
  try {
    await productStore.fetchAllProducts();
    await productStore.fetchAllCategories();
    await inventoryStore.fetchAllInventory();
    await inventoryStore.fetchInventoryWithProducts();
  } catch (error) {
    console.error('加载库存数据失败:', error);
    $q.notify({
      color: 'negative',
      message: '加载库存数据失败',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
});
</script>