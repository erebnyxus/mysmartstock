<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h5 class="q-mt-none q-mb-md">入库登记</h5>
      </div>
      <div class="col-auto">
        <q-btn color="secondary" icon="arrow_back" label="返回" :to="'/inventory'" />
      </div>
    </div>

    <q-card>
      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- 商品选择 -->
            <div class="col-12">
              <q-select
                v-model="selectedProduct"
                :options="productOptions"
                label="选择商品 *"
                outlined
                use-input
                hide-selected
                fill-input
                input-debounce="0"
                emit-value
                map-options
                :rules="[val => !!val || '请选择一个商品']"
                option-label="label"
                option-value="value"
                @filter="filterProducts"
              />
            </div>

            <!-- 数量和单位 -->
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="quantity"
                label="入库数量 *"
                type="number"
                outlined
                :rules="[
                  val => (val !== null && val !== undefined) || '请输入入库数量',
                  val => val > 0 || '数量必须大于0'
                ]"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="unit"
                label="单位"
                outlined
                readonly
                :disable="!selectedProduct"
              />
            </div>

            <!-- 入库信息 -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="batchNumber"
                label="批次号"
                outlined
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="location"
                label="存放位置"
                outlined
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model.number="costPrice"
                label="成本价"
                type="number"
                outlined
              />
            </div>

            <!-- 备注 -->
            <div class="col-12">
              <q-input
                v-model="notes"
                label="备注"
                type="textarea"
                outlined
                autogrow
              />
            </div>

            <!-- 提交按钮 -->
            <div class="col-12 q-gutter-md q-mt-md">
              <q-btn type="submit" color="primary" label="确认入库" :loading="saving" />
              <q-btn label="取消" flat color="secondary" :to="'/inventory'" />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useProductStore } from '@/stores/product-store';
import { useInventoryStore } from '@/stores/inventory-store';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const inventoryStore = useInventoryStore();

// 状态
const saving = ref(false);
const selectedProduct = ref(null);
const quantity = ref(1);
const unit = ref('');
const batchNumber = ref('');
const location = ref('');
const costPrice = ref(null);
const notes = ref('');

// 产品列表
const productOptions = ref([]);
const originalProducts = ref([]);

// 监听选择的商品变化
watch(selectedProduct, async (newProductId) => {
  if (newProductId) {
    const product = productStore.getProductById(newProductId);
    if (!product) return;
    
    // 获取库存信息
    const inventory = inventoryStore.getInventoryByProductId(newProductId);
    if (inventory) {
      unit.value = inventory.unit || '个';
      location.value = inventory.location || '';
      costPrice.value = inventory.cost_price || null;
    } else {
      unit.value = '个';
      location.value = '';
      costPrice.value = null;
    }
  } else {
    resetForm();
  }
});

// 根据查询条件筛选商品
const filterProducts = (val, update) => {
  if (val === '') {
    update(() => {
      productOptions.value = originalProducts.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    productOptions.value = originalProducts.value.filter(
      v => v.label.toLowerCase().indexOf(needle) > -1 ||
           v.sku.toLowerCase().indexOf(needle) > -1
    );
  });
};

// 重置表单
const resetForm = () => {
  selectedProduct.value = null;
  quantity.value = 1;
  unit.value = '';
  batchNumber.value = '';
  location.value = '';
  costPrice.value = null;
  notes.value = '';
};

// 提交表单
const onSubmit = async () => {
  saving.value = true;
  
  try {
    // 记录入库事务
    await inventoryStore.recordTransaction({
      product_id: selectedProduct.value,
      type: 'in',
      quantity: quantity.value,
      notes: `入库: ${notes.value || '无备注'}, 批次: ${batchNumber.value || '无批次号'}`,
      operator: 'admin'
    });
    
    // 如果有成本价更新，同时更新库存的成本价
    const productInventory = inventoryStore.getInventoryByProductId(selectedProduct.value);
    if (productInventory && productInventory.id && costPrice.value !== null) {
      await inventoryStore.updateInventory(productInventory.id, {
        cost_price: costPrice.value,
        location: location.value || productInventory.location
      });
    }
    
    $q.notify({
      color: 'positive',
      message: `入库成功! ${quantity.value} ${unit.value} 已添加到库存`,
      icon: 'check'
    });
    
    // 重置表单或返回库存页面
    if (route.query.returnTo === 'stay') {
      resetForm();
    } else {
      router.push('/inventory');
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: `入库失败: ${(error as Error).message}`,
      icon: 'warning'
    });
  } finally {
    saving.value = false;
  }
};

// 初始化产品选项
const initProductOptions = () => {
  originalProducts.value = productStore.products.map(p => ({
    label: p.name,
    value: p.id,
    sku: p.sku
  }));
  productOptions.value = [...originalProducts.value];
};

// 页面初始化
onMounted(async () => {
  // 加载产品数据
  if (productStore.products.length === 0) {
    await productStore.fetchAllProducts();
  }
  
  // 加载库存数据
  if (inventoryStore.inventory.length === 0) {
    await inventoryStore.fetchAllInventory();
  }
  
  // 初始化产品选项
  initProductOptions();
  
  // 如果URL中有product参数，自动选择该产品
  const productId = route.query.product;
  if (productId) {
    selectedProduct.value = productId.toString();
  }
});
</script>