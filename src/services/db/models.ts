/**
 * SmartStock Database Models
 *
 * This file defines the data models used in the SmartStock application.
 * These models correspond to the database tables defined in the schema.
 */

/**
 * Product Model
 * Represents a product in the inventory system
 */
export interface Product {
  id?: string;
  name: string;
  sku: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  attributes?: Record<string, string | number | boolean | string[]>;
  images?: string[];
  barcode?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Inventory Model
 * Represents the current inventory status of a product
 */
export interface Inventory {
  id?: string;
  product_id: string;
  quantity: number;
  unit: string;
  location?: string;
  min_quantity?: number;
  cost_price?: number;
  selling_price?: number;
  batch?: string;
  expiry_date?: Date;
  updated_at: Date;
}

/**
 * Inventory Transaction Model
 * Records inventory operations (stock-in, stock-out, adjustments)
 */
export interface InventoryTransaction {
  id?: string;
  product_id: string;
  type: 'in' | 'out' | 'adjust'; // stock-in, stock-out, adjustment
  quantity: number;
  before_quantity: number;
  after_quantity: number;
  date: Date;
  notes?: string;
  reference?: string;
  operator?: string;
}

/**
 * Category Model
 * Represents product categories in a hierarchical structure
 */
export interface Category {
  id?: string;
  name: string;
  parent_id?: string;
  description?: string;
  icon?: string;
}

/**
 * Settings Model
 * Stores application settings and preferences
 */
export interface Settings {
  id: string;
  value: string | number | boolean | null | Record<string, unknown> | unknown[];
  updated_at?: Date;
}

/**
 * Inventory with Product Model
 * Combined model for displaying inventory with product details
 * Used for UI display purposes
 */
export interface InventoryWithProduct {
  id: string;
  product_name: string;
  product_sku: string;
  category_name?: string;
  quantity: number;
  unit: string;
  location?: string;
  min_quantity?: number;
  cost_price?: number;
  selling_price?: number;
  tags?: string[];
  status: 'normal' | 'low' | 'out'; // normal, low stock, out of stock
}

/**
 * User Model
 * For future multi-user support (mentioned in PRD section 10.1)
 */
export interface User {
  id?: string;
  username: string;
  email?: string;
  display_name?: string;
  password_hash?: string; // Stored securely
  role?: 'admin' | 'user' | 'viewer';
  preferences?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

/**
 * Supplier Model
 * For future supplier management (mentioned in PRD section 10.1)
 */
export interface Supplier {
  id?: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Order Model
 * For future simple order management (mentioned in PRD section 10.1)
 */
export interface Order {
  id?: string;
  reference: string;
  date: Date;
  status: 'draft' | 'pending' | 'completed' | 'cancelled';
  supplier_id?: string;
  total_amount?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Order Item Model
 * Individual items within an order
 */
export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
}

/**
 * Inventory Report Model
 * For generating inventory reports
 */
export interface InventoryReport {
  id?: string;
  name: string;
  type: 'inventory' | 'transaction' | 'value' | 'turnover';
  date_range: {
    start: Date;
    end: Date;
  };
  parameters?: Record<string, unknown>;
  created_at: Date;
  data?: unknown; // Report data in JSON format
}

/**
 * Barcode Model
 * For barcode generation and management
 */
export interface Barcode {
  id?: string;
  product_id: string;
  barcode_type: 'ean13' | 'code128' | 'qrcode' | 'datamatrix';
  barcode_value: string;
  label_template?: string;
  created_at: Date;
}
