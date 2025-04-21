<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h5 class="q-mt-none q-mb-md">库存报表</h5>
      </div>
    </div>

    <!-- 报表类型选择卡片 -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="reportType"
              :options="reportTypes"
              label="报表类型"
              outlined
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-4">
            <q-input
              v-model="dateRange.from"
              outlined
              label="开始日期"
              mask="date"
              :rules="['date']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="dateRange.from">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="关闭" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <q-input
              v-model="dateRange.to"
              outlined
              label="结束日期"
              mask="date"
              :rules="['date']"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="dateRange.to">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="关闭" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12">
            <q-btn color="primary" icon="search" label="生成报表" @click="generateReport" />
            <q-btn color="secondary" flat icon="print" label="打印" class="q-ml-md" @click="printReport" />
            <q-btn color="accent" flat icon="file_download" label="导出CSV" class="q-ml-md" @click="exportCsv" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 报表内容 -->
    <div v-if="reportType === 'inventory'">
      <h6>当前库存状态报表</h6>
      <q-card>
        <q-card-section>
          <div class="row q-mb-md">
            <div class="col-12 col-md-4">
              <div class="text-subtitle2">库存总数</div>
              <div class="text-h5">{{ inventorySummary.totalItems }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-subtitle2">库存总价值</div>
              <div class="text-h5">{{ formatCurrency(inventorySummary.totalValue) }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-subtitle2">商品种类数</div>
              <div class="text-h5">{{ inventorySummary.distinctProducts }}</div>
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <div class="row">
            <div class="col-12">
              <q-table
                :rows="inventoryData"
                :columns="inventoryColumns"
                row-key="id"
                :pagination="{rowsPerPage: 10}"
                :loading="loading"
              >
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-chip :color="getStatusColor(props.value)" text-color="white" dense>
                      {{ getStatusText(props.value) }}
                    </q-chip>
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="reportType === 'transactions'">
      <h6>库存交易记录报表</h6>
      <q-card>
        <q-card-section>
          <q-table
            :rows="transactionData"
            :columns="transactionColumns"
            row-key="id"
            :pagination="{rowsPerPage: 10}"
            :loading="loading"
          >
            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                <q-chip :color="getTransactionColor(props.value)" text-color="white" dense>
                  {{ getTransactionTypeText(props.value) }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="reportType === 'lowstock'">
      <h6>低库存预警报表</h6>
      <q-card>
        <q-card-section>
          <q-table
            :rows="lowStockData"
            :columns="lowStockColumns"
            row-key="id"
            :pagination="{rowsPerPage: 10}"
            :loading="loading"
          >
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-chip color="warning" text-color="white" dense>
                  库存低
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useProductStore } from '@/stores/product-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { InventoryWithProduct, InventoryTransaction } from '@/services/db/models';
import { db } from '@/services/db';

const $q = useQuasar();
const productStore = useProductStore();
const inventoryStore = useInventoryStore();

// 状态
const loading = ref(false);
const reportType = ref('inventory');
const dateRange = ref({
  from: formatDateForInput(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30天前
  to: formatDateForInput(new Date()) // 今天
});

// 报表类型选项
const reportTypes = [
  { label: '当前库存状态', value: 'inventory' },
  { label: '库存交易记录', value: 'transactions' },
  { label: '低库存预警', value: 'lowstock' }
];

// 库存报表列
const inventoryColumns = [
  { name: 'product_name', label: '商品名称', field: 'product_name', sortable: true, align: 'left' },
  { name: 'product_sku', label: 'SKU', field: 'product_sku', sortable: true, align: 'left' },
  { name: 'category_name', label: '分类', field: 'category_name', sortable: true, align: 'left' },
  { name: 'quantity', label: '库存数量', field: 'quantity', sortable: true, align: 'left' },
  { name: 'unit', label: '单位', field: 'unit', sortable: true, align: 'left' },
  { name: 'value', label: '库存价值', field: row => row.quantity * (row.cost_price || 0), sortable: true, align: 'left', 
    format: val => formatCurrency(val) },
  { name: 'status', label: '库存状态', field: 'status', sortable: true, align: 'left' }
];

// 交易记录报表列
const transactionColumns = [
  { name: 'date', label: '日期', field: 'date', sortable: true, align: 'left',
    format: val => formatDate(val) },
  { name: 'product_name', label: '商品名称', field: row => getProductName(row.product_id), sortable: true, align: 'left' },
  { name: 'type', label: '操作类型', field: 'type', sortable: true, align: 'left' },
  { name: 'quantity', label: '数量', field: 'quantity', sortable: true, align: 'left' },
  { name: 'before_quantity', label: '操作前数量', field: 'before_quantity', sortable: true, align: 'left' },
  { name: 'after_quantity', label: '操作后数量', field: 'after_quantity', sortable: true, align: 'left' },
  { name: 'notes', label: '备注', field: 'notes', sortable: true, align: 'left' }
];

// 低库存报表列
const lowStockColumns = [
  { name: 'product_name', label: '商品名称', field: 'product_name', sortable: true, align: 'left' },
  { name: 'product_sku', label: 'SKU', field: 'product_sku', sortable: true, align: 'left' },
  { name: 'quantity', label: '当前库存', field: 'quantity', sortable: true, align: 'left' },
  { name: 'min_quantity', label: '最低库存', field: 'min_quantity', sortable: true, align: 'left' },
  { name: 'unit', label: '单位', field: 'unit', sortable: true, align: 'left' },
  { name: 'status', label: '状态', field: 'status', sortable: false, align: 'left' },
  { name: 'action', label: '建议操作', field: row => `补货 ${Math.max(0, (row.min_quantity || 0) * 2 - row.quantity)} ${row.unit}`,
    sortable: false, align: 'left' }
];

// 报表数据
const inventoryData = ref<InventoryWithProduct[]>([]);
const transactionData = ref<InventoryTransaction[]>([]);
const lowStockData = ref<InventoryWithProduct[]>([]);

// 库存摘要
const inventorySummary = computed(() => {
  return {
    totalItems: inventoryData.value.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: inventoryData.value.reduce((sum, item) => sum + (item.cost_price || 0) * item.quantity, 0),
    distinctProducts: inventoryData.value.length
  };
});

// 格式化日期
function formatDate(date: Date) {
  return new Date(date).toLocaleString('zh-CN');
}

// 格式化日期为输入框格式
function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

// 格式化货币
function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(value || 0);
}

// 获取产品名称
function getProductName(productId: string) {
  const product = productStore.getProductById(productId);
  return product ? product.name : '未知商品';
}

// 获取状态颜色
function getStatusColor(status: string) {
  switch (status) {
    case 'low': return 'warning';
    case 'out': return 'negative';
    default: return 'positive';
  }
}

// 获取状态文本
function getStatusText(status: string) {
  switch (status) {
    case 'low': return '库存低';
    case 'out': return '缺货';
    default: return '正常';
  }
}

// 获取交易类型颜色
function getTransactionColor(type: string) {
  switch (type) {
    case 'in': return 'positive';
    case 'out': return 'negative';
    case 'adjust': return 'info';
    default: return 'grey';
  }
}

// 获取交易类型文本
function getTransactionTypeText(type: string) {
  switch (type) {
    case 'in': return '入库';
    case 'out': return '出库';
    case 'adjust': return '调整';
    default: return '未知';
  }
}

// 生成报表
async function generateReport() {
  loading.value = true;
  
  try {
    // 确保数据已加载
    await productStore.fetchAllProducts();
    await productStore.fetchAllCategories();
    await inventoryStore.fetchAllInventory();
    
    if (reportType.value === 'inventory') {
      // 获取库存报表数据
      await inventoryStore.fetchInventoryWithProducts();
      inventoryData.value = [...inventoryStore.inventoryWithProducts];
    } else if (reportType.value === 'transactions') {
      // 获取交易记录报表数据
      const fromDate = new Date(dateRange.value.from);
      const toDate = new Date(dateRange.value.to);
      toDate.setHours(23, 59, 59, 999); // 设置为当天结束
      
      // 获取日期范围内的交易
      transactionData.value = await db.transactions
        .where('date')
        .between(fromDate, toDate)
        .toArray();
    } else if (reportType.value === 'lowstock') {
      // 获取低库存报表数据
      await inventoryStore.fetchInventoryWithProducts();
      lowStockData.value = inventoryStore.lowStockItems;
    }
    
    $q.notify({
      color: 'positive',
      message: '报表生成成功',
      icon: 'check'
    });
  } catch (error) {
    console.error('生成报表失败:', error);
    $q.notify({
      color: 'negative',
      message: '生成报表失败',
      icon: 'error'
    });
  } finally {
    loading.value = false;
  }
}

// 打印报表
function printReport() {
  window.print();
}

// 导出CSV
function exportCsv() {
  let data: any[] = [];
  let headers: string[] = [];
  let fileName = '';
  
  if (reportType.value === 'inventory') {
    data = inventoryData.value;
    headers = inventoryColumns.map(col => col.label);
    fileName = '库存报表';
  } else if (reportType.value === 'transactions') {
    data = transactionData.value;
    headers = transactionColumns.map(col => col.label);
    fileName = '交易记录报表';
  } else if (reportType.value === 'lowstock') {
    data = lowStockData.value;
    headers = lowStockColumns.map(col => col.label);
    fileName = '低库存报表';
  }
  
  if (data.length === 0) {
    $q.notify({
      color: 'warning',
      message: '没有数据可导出',
      icon: 'warning'
    });
    return;
  }
  
  // 简单CSV导出实现
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = Object.values(row);
    csv += values.join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  $q.notify({
    color: 'positive',
    message: 'CSV导出成功',
    icon: 'check'
  });
}

// 页面初始化
onMounted(async () => {
  try {
    // 预加载库存数据
    await generateReport();
  } catch (error) {
    console.error('初始化报表页面失败:', error);
  }
});
</script>