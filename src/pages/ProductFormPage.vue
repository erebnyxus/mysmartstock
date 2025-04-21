<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h5 class="q-mt-none q-mb-md">{{ isEdit ? '编辑' : '添加' }}商品</h5>
      </div>
      <div class="col-auto">
        <q-btn color="secondary" icon="arrow_back" label="返回" :to="'/products'" />
      </div>
    </div>

    <q-card>
      <q-card-section>
        <q-form ref="productForm" @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- 基本信息 -->
            <div class="col-12">
              <div class="text-subtitle1 q-mb-sm">基本信息</div>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.name"
                label="商品名称 *"
                :rules="[(val) => !!val || '商品名称不能为空']"
                outlined
                stack-label
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="form.sku"
                label="SKU *"
                :rules="[(val) => !!val || 'SKU不能为空']"
                outlined
                stack-label
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.description"
                label="商品描述"
                type="textarea"
                outlined
                stack-label
                autogrow
              />
            </div>

            <div class="col-12 col-md-6">
              <q-select
                v-model="form.category_id"
                :options="categoryOptions"
                label="商品分类"
                outlined
                stack-label
                emit-value
                map-options
                clearable
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input v-model="form.barcode" label="条码" outlined stack-label />
            </div>

            <!-- 标签 -->
            <div class="col-12">
              <div class="text-subtitle1 q-mb-sm">标签</div>
              <q-select
                v-model="form.tags"
                label="标签"
                outlined
                stack-label
                use-input
                use-chips
                multiple
                hide-dropdown-icon
                input-debounce="0"
                @new-value="createTag"
                :options="tagSuggestions"
              />
              <div class="text-caption q-mt-xs">输入标签并按回车添加多个标签</div>
            </div>

            <!-- 自定义属性 -->
            <div class="col-12">
              <div class="text-subtitle1 q-mb-sm">自定义属性</div>
              <div class="row q-col-gutter-md" v-for="(_, index) in attributePairs" :key="index">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="attributePairs[index].key"
                    label="属性名"
                    outlined
                    dense
                    class="q-mb-sm"
                  />
                </div>
                <div class="col-10 col-sm-5">
                  <q-input
                    v-model="attributePairs[index].value"
                    label="属性值"
                    outlined
                    dense
                    class="q-mb-sm"
                  />
                </div>
                <div class="col-2 col-sm-1 flex items-center">
                  <q-btn
                    round
                    flat
                    dense
                    color="negative"
                    icon="delete"
                    @click="removeAttribute(index)"
                  />
                </div>
              </div>
              <div class="q-mt-sm">
                <q-btn color="primary" outline label="添加属性" icon="add" @click="addAttribute" />
              </div>
            </div>

            <!-- 库存信息 -->
            <div class="col-12">
              <div class="text-subtitle1 q-mb-sm">默认库存信息</div>
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model.number="inventory.quantity"
                label="初始库存数量"
                type="number"
                outlined
                stack-label
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model="inventory.unit"
                label="单位"
                outlined
                stack-label
                placeholder="如: 台、个、箱等"
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input v-model="inventory.location" label="存放位置" outlined stack-label />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model.number="inventory.cost_price"
                label="成本价"
                type="number"
                outlined
                stack-label
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model.number="inventory.selling_price"
                label="销售价"
                type="number"
                outlined
                stack-label
              />
            </div>

            <div class="col-12 col-md-4">
              <q-input
                v-model.number="inventory.min_quantity"
                label="最低库存警戒线"
                type="number"
                outlined
                stack-label
              />
            </div>

            <!-- 提交按钮 -->
            <div class="col-12 q-gutter-md q-mt-md">
              <q-btn type="submit" color="primary" label="保存" :loading="saving" />
              <q-btn label="取消" flat color="secondary" :to="'/products'" />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useProductStore } from '@/stores/product-store';
import { useInventoryStore } from '@/stores/inventory-store';
import type { Product, Inventory } from '@/services/db/models';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const inventoryStore = useInventoryStore();

// 状态
const loading = ref(false);
const saving = ref(false);
const productId = computed(() => route.params.id as string);
const isEdit = computed(() => !!productId.value);

// 表单引用
const productForm = ref(null);

// 表单数据
const form = ref<Partial<Product>>({
  name: '',
  sku: '',
  description: '',
  category_id: '',
  barcode: '',
  tags: [],
  attributes: {},
});

// 库存数据
const inventory = ref<Partial<Inventory>>({
  quantity: 0,
  unit: '个',
  location: '',
  min_quantity: 0,
  cost_price: 0,
  selling_price: 0,
});

// 自定义属性
const attributePairs = ref<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);

// 标签建议
const tagSuggestions = ref<string[]>([]);

// 分类选项
const categoryOptions = computed(() => {
  return productStore.categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));
});

// 添加自定义属性
const addAttribute = () => {
  attributePairs.value.push({ key: '', value: '' });
};

// 移除自定义属性
const removeAttribute = (index: number) => {
  attributePairs.value.splice(index, 1);
};

// 创建新标签
const createTag = (val: string, done: (val?: string) => void) => {
  if (val.length > 0) {
    if (!tagSuggestions.value.includes(val)) {
      tagSuggestions.value.push(val);
    }
    done(val);
  } else {
    done();
  }
};

// 从自定义属性对构建属性对象
const buildAttributesObject = (): Record<string, string> => {
  const result: Record<string, string> = {};
  attributePairs.value.forEach((pair) => {
    if (pair.key && pair.value) {
      result[pair.key] = pair.value;
    }
  });
  return result;
};

// 从属性对象构建自定义属性对
const buildAttributePairsFromObject = (obj?: Record<string, string>) => {
  if (!obj) {
    attributePairs.value = [{ key: '', value: '' }];
    return;
  }

  attributePairs.value = Object.entries(obj).map(([key, value]) => ({ key, value }));

  // 确保至少有一个空行
  if (attributePairs.value.length === 0) {
    attributePairs.value.push({ key: '', value: '' });
  }
};

// 加载商品数据
const loadProductData = async () => {
  if (!isEdit.value) return;

  loading.value = true;
  try {
    // 确保产品数据已加载
    if (productStore.products.length === 0) {
      await productStore.fetchAllProducts();
    }

    const product = productStore.getProductById(productId.value);
    if (!product) {
      throw new Error('找不到该商品');
    }

    // 设置表单数据
    form.value = { ...product };

    // 设置自定义属性
    buildAttributePairsFromObject(product.attributes);

    // 加载库存数据
    if (inventoryStore.inventory.length === 0) {
      await inventoryStore.fetchAllInventory();
    }

    const productInventory = inventoryStore.getInventoryByProductId(productId.value);
    if (productInventory) {
      inventory.value = { ...productInventory };
    }
  } catch (error) {
    console.error('加载商品数据失败:', error);
    $q.notify({
      color: 'negative',
      message: `加载商品数据失败: ${(error as Error).message}`,
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
};

// 提交表单
const onSubmit = async () => {
  // 构建属性对象
  form.value.attributes = buildAttributesObject();

  saving.value = true;
  try {
    if (isEdit.value) {
      // 更新商品
      await productStore.updateProduct(productId.value, form.value);

      // 更新库存
      const productInventory = inventoryStore.getInventoryByProductId(productId.value);
      if (productInventory && productInventory.id) {
        await inventoryStore.updateInventory(productInventory.id, inventory.value);
      } else {
        // 如果商品没有库存记录，创建一个新的
        await inventoryStore.addInventory({
          ...inventory.value,
          product_id: productId.value,
          updated_at: new Date(),
        });
      }

      $q.notify({
        color: 'positive',
        message: `商品 ${form.value.name} 已成功更新`,
        icon: 'check',
      });
    } else {
      // 添加新商品
      const id = await productStore.addProduct(form.value);

      // 为新商品添加库存记录
      await inventoryStore.addInventory({
        ...inventory.value,
        product_id: id.toString(),
        updated_at: new Date(),
      });

      $q.notify({
        color: 'positive',
        message: `商品 ${form.value.name} 已成功添加`,
        icon: 'check',
      });

      // 重定向到产品列表页
      await router.push('/products');
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: `保存失败: ${(error as Error).message}`,
      icon: 'warning',
    });
  } finally {
    saving.value = false;
  }
};

// 页面加载时初始化数据
onMounted(async () => {
  try {
    // 加载分类数据
    if (productStore.categories.length === 0) {
      await productStore.fetchAllCategories();
    }

    // 收集已有的标签作为建议
    if (productStore.products.length === 0) {
      await productStore.fetchAllProducts();
    }

    const tags = new Set<string>();
    productStore.products.forEach((product) => {
      if (product.tags) {
        product.tags.forEach((tag) => tags.add(tag));
      }
    });

    tagSuggestions.value = Array.from(tags);

    // 如果是编辑模式，加载商品数据
    if (isEdit.value) {
      await loadProductData();
    }
  } catch (error) {
    console.error('初始化商品表单数据失败:', error);
  }
});
</script>
