<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <div class="col">
        <h5 class="q-mt-none q-mb-md">系统设置</h5>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- 基本设置 -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">基本设置</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-form @submit="saveBasicSettings" class="q-gutter-md">
              <q-input v-model="settings.appName" label="应用名称" outlined :loading="loading" />

              <q-input
                v-model="settings.companyName"
                label="公司名称"
                outlined
                :loading="loading"
              />

              <q-select
                v-model="settings.currency"
                :options="currencyOptions"
                label="货币单位"
                outlined
                emit-value
                map-options
                :loading="loading"
              />

              <div class="q-mt-md">
                <q-btn type="submit" color="primary" label="保存" :loading="saving" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- 显示设置 -->
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section>
            <div class="text-h6">显示设置</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-form @submit="saveDisplaySettings" class="q-gutter-md">
              <div>
                <div class="text-subtitle2 q-mb-sm">主题</div>
                <q-option-group
                  v-model="settings.theme"
                  :options="themeOptions"
                  color="primary"
                  inline
                  :loading="loading"
                />
              </div>

              <q-input
                v-model.number="settings.tableRowsPerPage"
                type="number"
                label="表格每页行数"
                outlined
                :loading="loading"
                :rules="[(val) => val > 0 || '每页行数必须大于0']"
              />

              <div class="q-mt-md">
                <q-btn type="submit" color="primary" label="保存" :loading="saving" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- 数据管理 -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">数据管理</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle2">数据备份</div>
                    <p>将所有库存数据导出为备份文件，以便恢复或迁移。</p>
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn color="primary" label="导出备份" icon="save_alt" @click="exportBackup" />
                  </q-card-actions>
                </q-card>
              </div>

              <div class="col-12 col-md-6">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-subtitle2">导入数据</div>
                    <p>从备份文件中恢复数据。</p>
                    <q-file
                      v-model="backupFile"
                      label="选择备份文件"
                      outlined
                      accept=".json"
                      bottom-slots
                    >
                      <template v-slot:prepend>
                        <q-icon name="upload_file" />
                      </template>
                      <template v-slot:hint> 只接受 .json 格式的备份文件 </template>
                    </q-file>
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn
                      color="primary"
                      label="导入"
                      icon="restore"
                      @click="importBackup"
                      :disabled="!backupFile"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 应用信息 -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">关于应用</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-6">
                <div class="text-subtitle2">SmartStock 智能库存管理系统</div>
                <div class="text-subtitle2">版本: {{ version }}</div>
                <p class="q-mt-md">
                  SmartStock 是一个轻量级的库存管理应用程序，可帮助小型企业管理其产品库存，
                  记录入库和出库操作，并生成相关报表。
                </p>
              </div>

              <div class="col-12 col-md-6">
                <q-list>
                  <q-item>
                    <q-item-section>
                      <q-item-label>技术栈</q-item-label>
                      <q-item-label caption
                        >Vue 3, TypeScript, Quasar Framework, Dexie.js</q-item-label
                      >
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label>存储</q-item-label>
                      <q-item-label caption>IndexedDB</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label>开发者</q-item-label>
                      <q-item-label caption>SmartStock 开发团队</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label>最后更新</q-item-label>
                      <q-item-label caption>{{
                        new Date().toLocaleDateString('zh-CN')
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { db } from '@/services/db';
import { version } from '../../package.json';

const $q = useQuasar();
const loading = ref(false);
const saving = ref(false);
const backupFile = ref(null);

// 设置项
const settings = ref({
  appName: 'SmartStock',
  companyName: '我的企业',
  currency: 'CNY',
  theme: 'light',
  tableRowsPerPage: 10,
});

// 选项
const currencyOptions = [
  { label: '人民币 (CNY)', value: 'CNY' },
  { label: '美元 (USD)', value: 'USD' },
  { label: '欧元 (EUR)', value: 'EUR' },
  { label: '英镑 (GBP)', value: 'GBP' },
  { label: '日元 (JPY)', value: 'JPY' },
];

const themeOptions = [
  { label: '亮色', value: 'light' },
  { label: '暗色', value: 'dark' },
];

// 加载设置
const loadSettings = async () => {
  loading.value = true;
  try {
    const appNameSetting = await db.settings.get('appName');
    if (appNameSetting) {
      settings.value.appName = appNameSetting.value;
    }

    const companyNameSetting = await db.settings.get('companyName');
    if (companyNameSetting) {
      settings.value.companyName = companyNameSetting.value;
    }

    const currencySetting = await db.settings.get('currency');
    if (currencySetting) {
      settings.value.currency = currencySetting.value;
    }

    const themeSetting = await db.settings.get('theme');
    if (themeSetting) {
      settings.value.theme = themeSetting.value;
      applyTheme(themeSetting.value);
    }

    const tableRowsPerPageSetting = await db.settings.get('tableRowsPerPage');
    if (tableRowsPerPageSetting) {
      settings.value.tableRowsPerPage = parseInt(tableRowsPerPageSetting.value);
    }
  } catch (error) {
    console.error('加载设置失败:', error);
    $q.notify({
      color: 'negative',
      message: '加载设置失败',
      icon: 'error',
    });
  } finally {
    loading.value = false;
  }
};

// 应用主题
const applyTheme = (theme: string) => {
  $q.dark.set(theme === 'dark');
};

// 保存基本设置
const saveBasicSettings = async () => {
  saving.value = true;
  try {
    await db.settings.put({ id: 'appName', value: settings.value.appName });
    await db.settings.put({ id: 'companyName', value: settings.value.companyName });
    await db.settings.put({ id: 'currency', value: settings.value.currency });

    $q.notify({
      color: 'positive',
      message: '基本设置保存成功',
      icon: 'check',
    });
  } catch (error) {
    console.error('保存基本设置失败:', error);
    $q.notify({
      color: 'negative',
      message: '保存设置失败',
      icon: 'error',
    });
  } finally {
    saving.value = false;
  }
};

// 保存显示设置
const saveDisplaySettings = async () => {
  saving.value = true;
  try {
    await db.settings.put({ id: 'theme', value: settings.value.theme });
    await db.settings.put({
      id: 'tableRowsPerPage',
      value: settings.value.tableRowsPerPage.toString(),
    });

    applyTheme(settings.value.theme);

    $q.notify({
      color: 'positive',
      message: '显示设置保存成功',
      icon: 'check',
    });
  } catch (error) {
    console.error('保存显示设置失败:', error);
    $q.notify({
      color: 'negative',
      message: '保存设置失败',
      icon: 'error',
    });
  } finally {
    saving.value = false;
  }
};

// 导出备份
const exportBackup = async () => {
  try {
    // 获取所有数据
    const products = await db.products.toArray();
    const categories = await db.categories.toArray();
    const inventory = await db.inventory.toArray();
    const transactions = await db.transactions.toArray();
    const settings = await db.settings.toArray();

    // 创建备份对象
    const backup = {
      products,
      categories,
      inventory,
      transactions,
      settings,
      version,
      exportDate: new Date().toISOString(),
    };

    // 导出为JSON
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      'download',
      `smartstock_backup_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    $q.notify({
      color: 'positive',
      message: '备份导出成功',
      icon: 'check',
    });
  } catch (error) {
    console.error('导出备份失败:', error);
    $q.notify({
      color: 'negative',
      message: '导出备份失败',
      icon: 'error',
    });
  }
};

// 导入备份
const importBackup = () => {
  if (!backupFile.value) return;

  try {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);

        // 验证备份文件
        if (!backup.products || !backup.categories || !backup.inventory || !backup.settings) {
          throw new Error('无效的备份文件');
        }

        // 确认导入
        $q.dialog({
          title: '确认导入',
          message: '导入将覆盖现有数据，确定要继续吗？',
          persistent: true,
          ok: {
            label: '确定',
            color: 'primary',
          },
          cancel: {
            label: '取消',
            color: 'negative',
          },
        }).onOk(() => {
          // Use void operator to call the async logic without returning a promise from the handler
          void (async () => {
            try {
              // 清除现有数据
              await db.products.clear();
              await db.categories.clear();
              await db.inventory.clear();
              await db.transactions.clear();
              await db.settings.clear();

              // 导入数据
              if (backup.products.length) await db.products.bulkAdd(backup.products);
              if (backup.categories.length) await db.categories.bulkAdd(backup.categories);
              if (backup.inventory.length) await db.inventory.bulkAdd(backup.inventory);
              if (backup.transactions && backup.transactions.length)
                await db.transactions.bulkAdd(backup.transactions); // Added check for transactions existence
              if (backup.settings.length) await db.settings.bulkAdd(backup.settings);

              $q.notify({
                color: 'positive',
                message: '备份导入成功，请刷新页面',
                icon: 'check',
                timeout: 5000,
              });

              // 重新加载设置
              await loadSettings();

              // 清空文件选择
              backupFile.value = null;
            } catch (importError) {
              console.error('导入数据时出错:', importError);
              $q.notify({
                color: 'negative',
                message: '导入数据时发生错误',
                icon: 'error',
              });
            }
          })();
        });
      } catch (error) {
        console.error('解析备份文件失败:', error);
        $q.notify({
          color: 'negative',
          message: '无效的备份文件',
          icon: 'error',
        });
      }
    };

    reader.readAsText(backupFile.value);
  } catch (error) {
    console.error('导入备份失败:', error);
    $q.notify({
      color: 'negative',
      message: '导入备份失败',
      icon: 'error',
    });
  }
};

// 页面初始化
onMounted(async () => {
  await loadSettings();
});
</script>
