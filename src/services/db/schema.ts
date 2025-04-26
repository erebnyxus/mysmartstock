/**
 * SmartStock Database Schema
 *
 * This file defines the database schema for the SmartStock application.
 * It uses Dexie.js to interact with IndexedDB for local storage.
 */

import Dexie, { type Table } from 'dexie';
import type {
  Product,
  Inventory,
  InventoryTransaction,
  Category,
  Settings,
  User,
  Supplier,
  Order,
  OrderItem,
} from './models';

/**
 * SmartStock Database Class
 *
 * Defines the database structure and provides methods for database operations.
 */
export class SmartStockDatabase extends Dexie {
  // Define tables
  products!: Table<Product>;
  inventory!: Table<Inventory>;
  transactions!: Table<InventoryTransaction>;
  categories!: Table<Category>;
  settings!: Table<Settings>;
  users!: Table<User>;
  suppliers!: Table<Supplier>;
  orders!: Table<Order>;
  orderItems!: Table<OrderItem>;

  constructor() {
    super('SmartStockDB');

    // Define database schema
    this.version(1).stores({
      // Core tables from PRD
      products: '++id, name, sku, category_id, barcode, *tags',
      inventory: '++id, product_id, quantity, location, min_quantity',
      transactions: '++id, product_id, type, date, reference',
      categories: '++id, name, parent_id',
      settings: 'id',

      // Extended tables for future expansion (as mentioned in PRD section 10.1)
      users: '++id, username, email',
      suppliers: '++id, name, contact',
      orders: '++id, date, status, reference',
      orderItems: '++id, order_id, product_id, quantity',
    });
  }

  /**
   * Initialize default data for the application
   * This method is called when the application is first run
   */
  async initializeDefaultData() {
    try {
      // Check if data already exists
      const productsCount = await this.products.count();

      if (productsCount > 0) return; // Data already exists, don't initialize

      // Add default categories
      const categoriesData: Partial<Category>[] = [
        {
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          icon: 'smartphone',
        },
        {
          name: 'Office Supplies',
          description: 'Office stationery and equipment',
          icon: 'business_center',
        },
        { name: 'Household Items', description: 'Daily household products', icon: 'home' },
      ];

      const categoryIds = (await this.categories.bulkAdd(categoriesData as Category[], {
        allKeys: true,
      })) as number[];
      if (!categoryIds || categoryIds.length < categoriesData.length) {
        throw new Error('Failed to initialize default categories: invalid categoryIds');
      }

      // Add sample products
      const productsData: Partial<Product>[] = [
        {
          name: 'iPhone 14 Pro',
          sku: 'IP14P-BLK-128',
          description: 'Apple iPhone 14 Pro 128GB Black',
          category_id: categoryIds[0].toString(),
          tags: ['phone', 'apple', 'premium'],
          barcode: '123456789012',
          attributes: { color: 'Black', storage: '128GB' },
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Office Chair',
          sku: 'OFC-CH-BLK',
          description: 'Ergonomic Office Chair Black',
          category_id: categoryIds[1].toString(),
          tags: ['furniture', 'office'],
          barcode: '223456789012',
          attributes: { color: 'Black', material: 'Mesh' },
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const productIds = (await this.products.bulkAdd(productsData as Product[], {
        allKeys: true,
      })) as number[];
      if (!productIds || productIds.length < productsData.length) {
        throw new Error('Failed to initialize default products: invalid productIds');
      }

      // Add inventory data
      const inventoryData: Partial<Inventory>[] = [
        {
          product_id: productIds[0].toString(),
          quantity: 10,
          unit: 'unit',
          location: 'A-01-01',
          min_quantity: 3,
          cost_price: 699.99,
          selling_price: 899.99,
          updated_at: new Date(),
        },
        {
          product_id: productIds[1].toString(),
          quantity: 5,
          unit: 'piece',
          location: 'B-02-03',
          min_quantity: 2,
          cost_price: 29.99,
          selling_price: 49.99,
          updated_at: new Date(),
        },
      ];

      await this.inventory.bulkAdd(inventoryData as Inventory[]);

      // Add initial transaction records
      const transactionData: Partial<InventoryTransaction>[] = [
        {
          product_id: productIds[0].toString(),
          type: 'in',
          quantity: 10,
          before_quantity: 0,
          after_quantity: 10,
          date: new Date(),
          notes: 'Initial inventory',
        },
        {
          product_id: productIds[1].toString(),
          type: 'in',
          quantity: 5,
          before_quantity: 0,
          after_quantity: 5,
          date: new Date(),
          notes: 'Initial inventory',
        },
      ];

      await this.transactions.bulkAdd(transactionData as InventoryTransaction[]);

      // Add default settings
      const defaultSettings: Settings[] = [
        { id: 'appName', value: 'SmartStock' },
        { id: 'companyName', value: 'My Company' },
        { id: 'currency', value: 'USD' },
        { id: 'theme', value: 'light' },
        { id: 'language', value: 'en-US' },
        { id: 'version', value: '1.0.0', updated_at: new Date() },
      ];

      await this.settings.bulkAdd(defaultSettings);

      console.log('Database initialization completed');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  /**
   * Get low stock items
   * Returns inventory items that are below their minimum quantity threshold
   */
  async getLowStockItems() {
    return await this.inventory
      .filter((item) => item.quantity <= (item.min_quantity || 0))
      .toArray();
  }

  /**
   * Get inventory value
   * Calculates the total value of inventory based on cost price
   */
  async getInventoryValue() {
    const inventory = await this.inventory.toArray();
    return inventory.reduce((total, item) => {
      return total + item.quantity * (item.cost_price || 0);
    }, 0);
  }

  /**
   * Backup database
   * Creates a JSON representation of the database for backup purposes
   */
  async backupDatabase() {
    const backup = {
      products: await this.products.toArray(),
      inventory: await this.inventory.toArray(),
      transactions: await this.transactions.toArray(),
      categories: await this.categories.toArray(),
      settings: await this.settings.toArray(),
    };

    return JSON.stringify(backup);
  }

  /**
   * Restore database from backup
   * Restores the database from a JSON backup
   */
  async restoreDatabase(backupJson: string) {
    try {
      const backup = JSON.parse(backupJson);

      // Clear existing data
      await this.transaction(
        'rw',
        [this.products, this.inventory, this.transactions, this.categories, this.settings],
        async () => {
          await this.products.clear();
          await this.inventory.clear();
          await this.transactions.clear();
          await this.categories.clear();
          await this.settings.clear();

          // Restore data
          if (backup.products) await this.products.bulkAdd(backup.products);
          if (backup.inventory) await this.inventory.bulkAdd(backup.inventory);
          if (backup.transactions) await this.transactions.bulkAdd(backup.transactions);
          if (backup.categories) await this.categories.bulkAdd(backup.categories);
          if (backup.settings) await this.settings.bulkAdd(backup.settings);
        },
      );

      return true;
    } catch (error) {
      console.error('Error restoring database:', error);
      throw error;
    }
  }
}

// Create and export database instance
export const db = new SmartStockDatabase();
