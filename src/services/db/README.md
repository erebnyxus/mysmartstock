# SmartStock Database Schema

This document describes the database schema for the SmartStock inventory management system.

## Overview

SmartStock uses IndexedDB for local data storage, with Dexie.js as the database wrapper. The database is designed to support offline-first operations and follows the data model specified in the product requirements document.

## Core Tables

### Products Table
Stores information about products in the inventory system.

| Field | Type | Description | Indexed |
|-------|------|-------------|---------|
| id | String | Primary key, auto-incremented | Yes |
| name | String | Product name | Yes |
| sku | String | Stock keeping unit | Yes |
| description | String | Product description | No |
| category_id | String | Foreign key to categories table | Yes |
| tags | Array<String> | Array of tags for the product | Yes (multi-entry) |
| attributes | Object | Custom attributes (color, size, etc.) | No |
| images | Array<String> | Array of image URIs | No |
| barcode | String | Product barcode | Yes |
| created_at | Date | Creation timestamp | No |
| updated_at | Date | Last update timestamp | No |

### Inventory Table
Tracks the current inventory status of products.

| Field | Type | Description | Indexed |
|-------|------|-------------|---------|
| id | String | Primary key, auto-incremented | Yes |
| product_id | String | Foreign key to products table | Yes |
| quantity | Number | Current inventory quantity | No |
| unit | String | Unit of measurement | No |
| location | String | Storage location | Yes |
| min_quantity | Number | Minimum quantity threshold for alerts | Yes |
| cost_price | Number | Cost price per unit | No |
| selling_price | Number | Selling price per unit | No |
| batch | String | Batch number | No |
| expiry_date | Date | Expiration date | No |
| updated_at | Date | Last update timestamp | No |

### Inventory Transaction Table
Records all inventory operations (stock-in, stock-out, adjustments).

| Field | Type | Description | Indexed |
|-------|------|-------------|---------|
| id | String | Primary key, auto-incremented | Yes |
| product_id | String | Foreign key to products table | Yes |
| type | String | Operation type: 'in', 'out', 'adjust' | Yes |
| quantity | Number | Operation quantity | No |
| before_quantity | Number | Inventory before operation | No |
| after_quantity | Number | Inventory after operation | No |
| date | Date | Operation date | Yes |
| notes | String | Notes about the transaction | No |
| reference | String | Reference number | Yes |
| operator | String | Person who performed the operation | No |

### Category Table
Organizes products into categories with optional hierarchical structure.

| Field | Type | Description | Indexed |
|-------|------|-------------|---------|
| id | String | Primary key, auto-incremented | Yes |
| name | String | Category name | Yes |
| parent_id | String | Parent category ID for hierarchical structure | Yes |
| description | String | Category description | No |
| icon | String | Icon name for the category | No |

### Settings Table
Stores application settings and preferences.

| Field | Type | Description | Indexed |
|-------|------|-------------|---------|
| id | String | Primary key, setting key name | Yes |
| value | Any | Setting value | No |
| updated_at | Date | Last update timestamp | No |

## Future Expansion Tables

These tables are defined in the schema but will be implemented in future versions.

### Users Table
For multi-user support.

| Field | Type | Description | Indexed |
|-------|------|-------------|---------|
| id | String | Primary key, auto-incremented | Yes |
| username | String | Username | Yes |
| email | String | Email address | Yes |
| display_name | String | Display name | No |
| password_hash | String | Securely stored password hash | No |
| role | String | User role: 'admin', 'user', 'viewer' | No |
| preferences | Object | User preferences | No |
| created_at | Date | Account creation timestamp | No |
| updated_at | Date | Last update timestamp | No |
| last_login | Date | Last login timestamp | No |

### Suppliers Table
For supplier management.

| Field | Type | Description | Indexed |
|-------|------|-------------|---------|
| id | String | Primary key, auto-incremented | Yes |
| name | String | Supplier name | Yes |
| contact_person | String | Contact person name | No |
| email | String | Email address | No |
| phone | String | Phone number | No |
| address | String | Physical address | No |
| notes | String | Additional notes | No |
| created_at | Date | Creation timestamp | No |
| updated_at | Date | Last update timestamp | No |

### Orders Table
For simple order management.

| Field | Type | Description | Indexed |
|-------|------|-------------|---------|
| id | String | Primary key, auto-incremented | Yes |
| reference | String | Order reference number | Yes |
| date | Date | Order date | Yes |
| status | String | Order status: 'draft', 'pending', 'completed', 'cancelled' | Yes |
| supplier_id | String | Foreign key to suppliers table | Yes |
| total_amount | Number | Total order amount | No |
| notes | String | Order notes | No |
| created_at | Date | Creation timestamp | No |
| updated_at | Date | Last update timestamp | No |

### Order Items Table
Individual items within an order.

| Field | Type | Description | Indexed |
|-------|------|-------------|---------|
| id | String | Primary key, auto-incremented | Yes |
| order_id | String | Foreign key to orders table | Yes |
| product_id | String | Foreign key to products table | Yes |
| quantity | Number | Order quantity | No |
| unit_price | Number | Unit price | No |
| total_price | Number | Total price for this item | No |

## Utility Methods

The database class provides several utility methods:

- `initializeDefaultData()`: Initializes the database with default data if empty
- `getLowStockItems()`: Returns inventory items below their minimum quantity threshold
- `getInventoryValue()`: Calculates the total value of inventory based on cost price
- `backupDatabase()`: Creates a JSON representation of the database for backup
- `restoreDatabase(backupJson)`: Restores the database from a JSON backup

## Indexing Strategy

- Primary keys are auto-incremented and indexed for fast lookups
- Foreign keys are indexed to optimize join operations
- Fields commonly used in filters and searches are indexed
- Multi-entry indexing is used for array fields like tags

## Data Relationships

- Products → Categories (many-to-one)
- Inventory → Products (one-to-one)
- Transactions → Products (many-to-one)
- Order Items → Products (many-to-one)
- Order Items → Orders (many-to-one)
- Orders → Suppliers (many-to-one)

## Schema Versioning

The database uses versioning to manage schema changes:
- Version 1: Core tables (products, inventory, transactions, categories, settings)
- Version 2 (future): Extended tables (users, suppliers, orders, etc.)

This approach allows for future expansion while maintaining backward compatibility.
