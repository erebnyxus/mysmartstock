import { defineStore } from 'pinia';
import { db } from '../services/db';
import { Product, Category } from '../services/db/models';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [] as Product[],
    categories: [] as Category[],
    loading: false,
    error: null as string | null,
  }),
  
  getters: {
    getProductById: (state) => {
      return (id: string) => state.products.find(p => p.id === id);
    },
    
    getCategoryById: (state) => {
      return (id: string) => state.categories.find(c => c.id === id);
    },
    
    categorizedProducts: (state) => {
      const result: Record<string, Product[]> = {};
      
      state.categories.forEach(category => {
        result[category.id as string] = state.products.filter(
          p => p.category_id === category.id
        );
      });
      
      return result;
    }
  },
  
  actions: {
    async fetchAllProducts() {
      this.loading = true;
      this.error = null;
      
      try {
        this.products = await db.products.toArray();
        // 确保所有 ID 都是字符串类型
        this.products = this.products.map(product => ({
          ...product,
          id: product.id!.toString()
        }));
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to fetch products:', err);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchAllCategories() {
      this.loading = true;
      this.error = null;
      
      try {
        this.categories = await db.categories.toArray();
        // 确保所有 ID 都是字符串类型
        this.categories = this.categories.map(category => ({
          ...category,
          id: category.id!.toString()
        }));
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to fetch categories:', err);
      } finally {
        this.loading = false;
      }
    },
    
    async addProduct(product: Partial<Product>) {
      try {
        // 确保创建和更新时间
        const now = new Date();
        product.created_at = now;
        product.updated_at = now;
        
        const id = await db.products.add(product as Product);
        
        // 添加到本地状态
        const newProduct = { ...product, id: id.toString() } as Product;
        this.products.push(newProduct);
        
        return id.toString();
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to add product:', err);
        throw err;
      }
    },
    
    async updateProduct(id: string, changes: Partial<Product>) {
      try {
        // 确保更新时间
        changes.updated_at = new Date();
        
        await db.products.update(id, changes);
        
        // 更新本地状态
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...changes } as Product;
        }
        
        return true;
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to update product:', err);
        throw err;
      }
    },
    
    async deleteProduct(id: string) {
      try {
        await db.products.delete(id);
        
        // 更新本地状态
        this.products = this.products.filter(p => p.id !== id);
        
        return true;
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to delete product:', err);
        throw err;
      }
    },
    
    async addCategory(category: Partial<Category>) {
      try {
        if (!category.name) {
          throw new Error('分类名称是必需的');
        }
        
        // 创建一个符合Category接口的对象
        const fullCategory = { name: category.name } as Category;
        if (category.parent_id) fullCategory.parent_id = category.parent_id;
        if (category.description) fullCategory.description = category.description;
        if (category.icon) fullCategory.icon = category.icon;
        
        const id = await db.categories.add(fullCategory);
        
        // 添加到本地状态
        const newCategory = { ...fullCategory, id: id.toString() } as Category;
        this.categories.push(newCategory);
        
        return id.toString();
      } catch (err) {
        this.error = (err as Error).message;
        console.error('Failed to add category:', err);
        throw err;
      }
    }
  }
});