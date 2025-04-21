import { boot } from 'quasar/wrappers';
import { createPinia } from 'pinia';
import { useProductStore, useInventoryStore } from '../stores';

export default boot(({ app }) => {
  // 创建并注册 Pinia 存储
  const pinia = createPinia();
  app.use(pinia);
});

// 导出store，这样它可以在组件外部使用
export { useProductStore, useInventoryStore } from '../stores';