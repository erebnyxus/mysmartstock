/**
 * 产品模型
 */
export interface Product {
  id?: string;
  name: string;
  sku: string;
  description?: string;
  category_id?: string;
  tags?: string[];
  attributes?: Record<string, any>;
  images?: string[];
  barcode?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * 库存模型
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
 * 库存操作记录模型
 */
export interface InventoryTransaction {
  id?: string;
  product_id: string;
  type: 'in' | 'out' | 'adjust'; // 入库、出库、调整
  quantity: number;
  before_quantity: number;
  after_quantity: number;
  date: Date;
  notes?: string;
  reference?: string;
  operator?: string;
}

/**
 * 分类模型
 */
export interface Category {
  id?: string;
  name: string;
  parent_id?: string;
  description?: string;
  icon?: string;
}

/**
 * 设置模型
 */
export interface Settings {
  id: string;
  value: any;
  updated_at?: Date;
}

/**
 * 库存与产品连接模型（用于查询显示）
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
  status: 'normal' | 'low' | 'out'; // 正常、低库存、缺货
}