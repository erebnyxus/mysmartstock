import Dexie, { Table } from 'dexie';
import { Product, Inventory, InventoryTransaction, Category, Settings } from './models';

/**
 * SmartStock数据库类
 * 使用Dexie.js操作IndexedDB
 */
export class SmartStockDatabase extends Dexie {
  // 定义表
  products!: Table<Product>;
  inventory!: Table<Inventory>;
  transactions!: Table<InventoryTransaction>;
  categories!: Table<Category>;
  settings!: Table<Settings>;

  constructor() {
    super('SmartStockDB');
    
    // 定义数据库架构
    this.version(1).stores({
      products: '++id, name, sku, category_id, barcode, *tags',
      inventory: '++id, product_id, quantity, location',
      transactions: '++id, product_id, type, date',
      categories: '++id, name, parent_id',
      settings: 'id'
    });
  }

  /**
   * 初始化示例数据
   */
  async initializeDefaultData() {
    try {
      // 检查是否已经有数据
      const productsCount = await this.products.count();
      
      if (productsCount > 0) return; // 已有数据，不初始化
      
      // 添加默认分类
      const categoriesData: Partial<Category>[] = [
        { name: '电子产品', description: '各类电子设备', icon: 'smartphone' },
        { name: '办公用品', description: '办公室日常用品', icon: 'business_center' },
        { name: '生活用品', description: '日常生活用品', icon: 'home' }
      ];
      
      const categoryIds = await this.categories.bulkAdd(categoriesData as Category[], { allKeys: true }) as number[];
      // 验证 categoryIds
      if (!categoryIds || categoryIds.length < categoriesData.length) {
        throw new Error('默认分类初始化失败: categoryIds 无效');
      }
      
      // 添加示例产品
      const productsData: Partial<Product>[] = [
        { 
          name: 'iPhone 14 Pro', 
          sku: 'IP14P-BLK-128', 
          description: 'Apple iPhone 14 Pro 128GB 黑色', 
          category_id: categoryIds[0]!.toString(), 
          tags: ['手机', '苹果', '高端'],
          barcode: '123456789012',
          attributes: { color: '黑色', storage: '128GB' },
          created_at: new Date(),
          updated_at: new Date()
        },
        { 
          name: '办公椅', 
          sku: 'OFC-CH-BLK', 
          description: '人体工学办公椅 黑色', 
          category_id: categoryIds[1]!.toString(), 
          tags: ['家具', '办公'],
          barcode: '223456789012',
          attributes: { color: '黑色', material: '网布' },
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      const productIds = await this.products.bulkAdd(productsData as Product[], { allKeys: true }) as number[];
      // 验证 productIds
      if (!productIds || productIds.length < productsData.length) {
        throw new Error('默认产品初始化失败: productIds 无效');
      }
      
      // 添加库存数据
      const inventoryData: Partial<Inventory>[] = [
        {
          product_id: productIds[0]!.toString(),
          quantity: 10,
          unit: '台',
          location: 'A-01-01',
          min_quantity: 3,
          cost_price: 6999,
          selling_price: 8999,
          updated_at: new Date()
        },
        {
          product_id: productIds[1]!.toString(),
          quantity: 5,
          unit: '把',
          location: 'B-02-03',
          min_quantity: 2,
          cost_price: 299,
          selling_price: 499,
          updated_at: new Date()
        }
      ];
      
      await this.inventory.bulkAdd(inventoryData as Inventory[]);
      
      // 添加一些初始交易记录
      const transactionData: Partial<InventoryTransaction>[] = [
        {
          product_id: productIds[0]!.toString(),
          type: 'in',
          quantity: 10,
          before_quantity: 0,
          after_quantity: 10,
          date: new Date(),
          notes: '初始库存'
        },
        {
          product_id: productIds[1]!.toString(),
          type: 'in',
          quantity: 5,
          before_quantity: 0,
          after_quantity: 5,
          date: new Date(),
          notes: '初始库存'
        }
      ];
      
      await this.transactions.bulkAdd(transactionData as InventoryTransaction[]);
      
      // 添加默认设置
      const defaultSettings: Settings[] = [
        { id: 'appName', value: 'SmartStock' },
        { id: 'companyName', value: '我的企业' },
        { id: 'currency', value: 'CNY' },
        { id: 'theme', value: 'light' },
        { id: 'version', value: '1.0.0', updated_at: new Date() }
      ];
      
      await this.settings.bulkAdd(defaultSettings);
      
      console.log('数据库初始化完成');
    } catch (error) {
      console.error('初始化数据库时出错:', error);
      throw error;
    }
  }
}

// 创建数据库实例并导出
export const db = new SmartStockDatabase();