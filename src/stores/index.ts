import { createPinia } from 'pinia';
import { useProductStore } from './product-store';
import { useInventoryStore } from './inventory-store';

export { useProductStore, useInventoryStore };

export default createPinia();
