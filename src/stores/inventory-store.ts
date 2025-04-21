import { defineStore } from "pinia";
import { db } from "../services/db";
import { Inventory, InventoryTransaction, InventoryWithProduct } from '../services/db/models';
import { useProductStore } from "./product-store";

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    inventory: [] as Inventory[],
    inventoryWithProducts: [] as InventoryWithProduct[],
    transactions: [] as InventoryTransaction[],
    loading: false,
    error: null as string | null,
  }),
  
  getters: {
    getInventoryByProductId: (state) => {
      return (productId: string) => state.inventory.find(item => item.product_id === productId);
    },
    
    lowStockItems: (state) => {
      return state.inventoryWithProducts.filter(
        item => item.quantity <= (item.min_quantity || 0)
      );
    },
    
    outOfStockItems: (state) => {
      return state.inventoryWithProducts.filter(item => item.quantity <= 0);
    },
    
    getTotalInventoryValue: (state) => {
      return state.inventory.reduce((sum, item) => {
        return sum + (item.cost_price || 0) * item.quantity;
      }, 0);
    },
    
    getTotalInventoryRetailValue: (state) => {
      return state.inventory.reduce((sum, item) => {
        return sum + (item.selling_price || 0) * item.quantity;
      }, 0);
    }
  },
  
  actions: {
    async fetchAllInventory() {
      this.loading = true;
      this.error = null;
      
      try {
        this.inventory = await db.inventory.toArray();
        // 确保所有 ID 都是字符串类型
        this.inventory = this.inventory.map(item => ({
          ...item,
          id: item.id!.toString(),
          product_id: item.product_id.toString()
        }));
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to fetch inventory:', err);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchInventoryWithProducts() {
      this.loading = true;
      this.error = null;
      
      try {
        // 确保产品数据已加载
        const productStore = useProductStore();
        if (productStore.products.length === 0) {
          await productStore.fetchAllProducts();
        }
        
        if (productStore.categories.length === 0) {
          await productStore.fetchAllCategories();
        }
        
        // 加载库存
        if (this.inventory.length === 0) {
          await this.fetchAllInventory();
        }
        
        // 合并产品和库存数据
        this.inventoryWithProducts = this.inventory.map(inv => {
          const product = productStore.getProductById(inv.product_id);
          const category = product?.category_id ? 
            productStore.getCategoryById(product.category_id) : undefined;
            
          // 确定库存状态
          let status: 'normal' | 'low' | 'out' = 'normal';
          if (inv.quantity <= 0) {
            status = 'out';
          } else if (inv.min_quantity && inv.quantity <= inv.min_quantity) {
            status = 'low';
          }
          
          return {
            id: inv.id as string,
            product_name: product?.name || '未知产品',
            product_sku: product?.sku || '无SKU',
            category_name: category?.name,
            quantity: inv.quantity,
            unit: inv.unit,
            location: inv.location,
            min_quantity: inv.min_quantity,
            cost_price: inv.cost_price,
            selling_price: inv.selling_price,
            tags: product?.tags,
            status
          } as InventoryWithProduct;
        });
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to fetch inventory with products:', err);
      } finally {
        this.loading = false;
      }
    },
    
    async addInventory(inventory: Partial<Inventory>) {
      try {
        // 确保更新时间
        inventory.updated_at = new Date();
        // 确保 product_id 是字符串类型
        if (inventory.product_id) {
          inventory.product_id = inventory.product_id.toString();
        }
        
        const id = await db.inventory.add(inventory as Inventory);
        
        // 添加到本地状态
        const newInventory = { ...inventory, id: id.toString() } as Inventory;
        this.inventory.push(newInventory);
        
        // 刷新合并数据
        await this.fetchInventoryWithProducts();
        
        return id.toString();
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to add inventory:', err);
        throw err;
      }
    },
    
    async updateInventory(id: string, changes: Partial<Inventory>) {
      try {
        // 确保更新时间
        changes.updated_at = new Date();
        
        await db.inventory.update(id, changes);
        
        // 更新本地状态
        const index = this.inventory.findIndex(item => item.id === id);
        if (index !== -1) {
          this.inventory[index] = { ...this.inventory[index], ...changes } as Inventory;
        }
        
        // 刷新合并数据
        await this.fetchInventoryWithProducts();
        
        return true;
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to update inventory:', err);
        throw err;
      }
    },
    
    async recordTransaction(transaction: Partial<InventoryTransaction>) {
      try {
        // 确保 product_id 是字符串类型
        if (transaction.product_id) {
          transaction.product_id = transaction.product_id.toString();
        }
        
        // 获取当前库存
        const inventory = await db.inventory
          .where('product_id')
          .equals(transaction.product_id as string)
          .first();
        
        if (!inventory) {
          throw new Error('找不到相关库存');
        }
        
        // 记录操作前数量
        transaction.before_quantity = inventory.quantity;
        
        // 根据操作类型调整库存
        let newQuantity = inventory.quantity;
        if (transaction.type === 'in') {
          newQuantity += transaction.quantity as number;
        } else if (transaction.type === 'out') {
          newQuantity -= transaction.quantity as number;
          if (newQuantity < 0) {
            throw new Error('库存不足，无法出库');
          }
        } else if (transaction.type === 'adjust') {
          newQuantity = transaction.quantity as number;
        }
        
        // 记录操作后数量
        transaction.after_quantity = newQuantity;
        transaction.date = new Date();
        
        // 保存事务记录
        const transId = await db.transactions.add(transaction as InventoryTransaction);
        
        // 更新库存
        await this.updateInventory(inventory.id?.toString() || '', {
          quantity: newQuantity,
          updated_at: new Date()
        });
        
        // 添加到本地事务列表
        this.transactions.push({
          ...transaction,
          id: transId.toString()
        } as InventoryTransaction);
        
        return {
          transactionId: transId.toString(),
          newQuantity
        };
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to record transaction:', err);
        throw err;
      }
    },
    
    async fetchRecentTransactions(limit: number = 20) {
      this.loading = true;
      this.error = null;
      
      try {
        this.transactions = await db.transactions
          .orderBy('date')
          .reverse()
          .limit(limit)
          .toArray();
        
        // 确保所有 ID 都是字符串类型
        this.transactions = this.transactions.map(transaction => ({
          ...transaction,
          id: transaction.id!.toString(),
          product_id: transaction.product_id.toString()
        }));
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to fetch recent transactions:', err);
      } finally {
        this.loading = false;
      }
    }
  }
});