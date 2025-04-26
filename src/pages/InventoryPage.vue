<template>
  <q-page class="inventory-page q-pa-responsive">
    <div class="row q-mb-md items-center">
      <div class="text-h5 q-mr-md">{{ $t('inventory') }}</div>
      <q-space />
      
      <!-- Search and filter controls -->
      <q-input
        v-model="searchText"
        dense
        outlined
        :placeholder="$t('search')"
        class="q-mr-sm"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      
      <q-btn-dropdown flat color="primary" :label="$t('filter')">
        <q-list>
          <q-item clickable v-close-popup @click="filterBy('all')">
            <q-item-section>
              <q-item-label>{{ $t('allItems') }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item clickable v-close-popup @click="filterBy('lowStock')">
            <q-item-section>
              <q-item-label>{{ $t('lowStock') }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-separator />
          
          <q-item-label header>{{ $t('categories') }}</q-item-label>
          
          <q-item 
            v-for="category in categories" 
            :key="category.id" 
            clickable 
            v-close-popup 
            @click="filterByCategory(category.id)"
          >
            <q-item-section>
              <q-item-label>{{ category.name }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
    
    <!-- Inventory table/list with responsive design -->
    <q-table
      :rows="filteredInventory"
      :columns="visibleColumns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :grid="$q.screen.lt.sm"
    >
      <!-- Custom grid item for mobile -->
      <template v-slot:item="props" v-if="$q.screen.lt.sm">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card>
            <q-card-section>
              <div class="text-h6">{{ props.row.name }}</div>
              <div class="text-subtitle2">{{ props.row.sku }}</div>
            </q-card-section>
            
            <q-separator />
            
            <q-card-section class="q-pt-none">
              <div class="row items-center">
                <div class="col">{{ $t('currentStock') }}:</div>
                <div class="col text-right text-weight-bold">
                  {{ props.row.currentStock }}
                </div>
              </div>
              
              <div class="row items-center q-mt-xs">
                <div class="col">{{ $t('category') }}:</div>
                <div class="col text-right">
                  {{ getCategoryName(props.row.categoryId) }}
                </div>
              </div>
            </q-card-section>
            
            <q-card-actions align="right">
              <inventory-action-button
                :product="props.row"
                @view-details="viewDetails(props.row)"
                @operation-complete="refreshInventory"
              />
            </q-card-actions>
          </q-card>
        </div>
      </template>
      
      <!-- Custom body slot for tablet/desktop -->
      <template v-slot:body="props" v-else>
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.value }}
          </q-td>
          <q-td auto-width>
            <inventory-action-button
              :product="props.row"
              @view-details="viewDetails(props.row)"
              @operation-complete="refreshInventory"
            />
          </q-td>
        </q-tr>
      </template>
      
      <!-- No data slot -->
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-center">
          <div>
            <q-icon name="inventory" size="4rem" color="grey-5" />
            <div class="text-h6 q-mt-md">{{ $t('noInventoryItems') }}</div>
            <div class="text-body2 q-mt-sm">{{ $t('noInventoryItemsMessage') }}</div>
            <q-btn
              color="primary"
              class="q-mt-lg"
              :label="$t('addProduct')"
              @click="navigateToAddProduct"
            />
          </div>
        </div>
      </template>
    </q-table>
    
    <!-- Global floating action button -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab
        icon="add"
        color="primary"
        direction="up"
      >
        <q-fab-action
          color="positive"
          icon="add_circle"
          label-position="left"
          external-label
          :label="$t('stockIn')"
          @click="openGlobalStockOperation('in')"
        />
        <q-fab-action
          color="negative"
          icon="remove_circle"
          label-position="left"
          external-label
          :label="$t('stockOut')"
          @click="openGlobalStockOperation('out')"
        />
        <q-fab-action
          color="secondary"
          icon="qr_code_scanner"
          label-position="left"
          external-label
          :label="$t('scanBarcode')"
          @click="openBarcodeScanner"
        />
      </q-fab>
    </q-page-sticky>
    
    <!-- Global stock operation dialog -->
    <stock-operation-dialog
      v-model="showGlobalStockDialog"
      :operation-type="currentOperation"
      @operation-complete="refreshInventory"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import InventoryActionButton from 'src/components/inventory/InventoryActionButton.vue';
import StockOperationDialog from 'src/components/inventory/StockOperationDialog.vue';
import { useInventoryStore } from 'src/stores/inventory-store';
import { useProductStore } from 'src/stores/product-store';

const $q = useQuasar();
const router = useRouter();
const { t } = useI18n();
const inventoryStore = useInventoryStore();
const productStore = useProductStore();

// State
const loading = ref(true);
const searchText = ref('');
const currentFilter = ref('all');
const currentCategoryFilter = ref(null);
const showGlobalStockDialog = ref(false);
const currentOperation = ref('in');
const pagination = ref({
  rowsPerPage: 10
});

// Computed
const categories = computed(() => {
  return productStore.categories;
});

const visibleColumns = computed(() => {
  // Responsive columns based on screen size
  const baseColumns = [
    {
      name: 'name',
      required: true,
      label: t('productName'),
      align: 'left',
      field: row => row.name,
      sortable: true
    },
    {
      name: 'sku',
      required: true,
      label: t('sku'),
      align: 'left',
      field: row => row.sku,
      sortable: true
    },
    {
      name: 'currentStock',
      required: true,
      label: t('currentStock'),
      align: 'right',
      field: row => row.currentStock,
      sortable: true
    }
  ];
  
  // Add more columns for larger screens
  if ($q.screen.gt.xs) {
    baseColumns.push({
      name: 'category',
      required: false,
      label: t('category'),
      align: 'left',
      field: row => getCategoryName(row.categoryId),
      sortable: true
    });
  }
  
  if ($q.screen.gt.sm) {
    baseColumns.push({
      name: 'lastUpdated',
      required: false,
      label: t('lastUpdated'),
      align: 'left',
      field: row => formatDate(row.lastUpdated),
      sortable: true
    });
  }
  
  return baseColumns;
});

const filteredInventory = computed(() => {
  let result = inventoryStore.inventoryWithProducts;
  
  // Apply search filter
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.sku.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply category filter
  if (currentCategoryFilter.value) {
    result = result.filter(item => item.categoryId === currentCategoryFilter.value);
  }
  
  // Apply other filters
  if (currentFilter.value === 'lowStock') {
    result = result.filter(item => item.currentStock <= item.minStockLevel);
  }
  
  return result;
});

// Methods
const refreshInventory = async () => {
  loading.value = true;
  await inventoryStore.fetchInventoryWithProducts();
  loading.value = false;
};

const filterBy = (filter) => {
  currentFilter.value = filter;
  currentCategoryFilter.value = null;
};

const filterByCategory = (categoryId) => {
  currentCategoryFilter.value = categoryId;
  currentFilter.value = 'all';
};

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : t('uncategorized');
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const viewDetails = (product) => {
  router.push({ name: 'product-details', params: { id: product.id } });
};

const navigateToAddProduct = () => {
  router.push({ name: 'product-form' });
};

const openGlobalStockOperation = (type) => {
  currentOperation.value = type;
  showGlobalStockDialog.value = true;
};

const openBarcodeScanner = () => {
  // This would integrate with a barcode scanning library
  // For now, we'll just show a notification
  $q.notify({
    message: t('barcodeScannerNotImplemented'),
    color: 'info'
  });
};

// Initialize
onMounted(async () => {
  loading.value = true;
  
  try {
    await Promise.all([
      productStore.fetchAllCategories(),
      inventoryStore.fetchInventoryWithProducts()
    ]);
  } catch (error) {
    console.error('Failed to load inventory data:', error);
    $q.notify({
      type: 'negative',
      message: t('failedToLoadInventory')
    });
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="sass" scoped>
.inventory-page
  .q-table__grid-item
    margin-bottom: 8px
</style>
