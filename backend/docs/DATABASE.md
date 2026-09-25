# Database Documentation - MongoDB

## Overview

The Finance Management System uses **MongoDB** as its primary NoSQL document database.

---

## MongoDB Schema & Setup Scripts

- **MongoDB Schema & Seed Script**: [`backend/database/schema.mongodb.js`](file:///c:/Users/acer/Documents/FINANCE/backend/database/schema.mongodb.js)
- **MongoDB Playground**: [`backend/database/playground-1.mongodb.js`](file:///c:/Users/acer/Documents/FINANCE/backend/database/playground-1.mongodb.js)

---

## Collections Architecture

| Collection Name | Description | Key Fields & Indexing |
|---|---|---|
| **`users`** | Authentication credentials & user details | `email` (Unique), `username` (Unique), `hashed_password`, `roles: ["User", "Admin"]`, `is_active` |
| **`categories`** | Income & Expense categories | `name` (Unique), `type` ("expense"/"income"), `icon` |
| **`payment_methods`** | Financial payment methods | `name` (Unique) |
| **`transactions`** | Master transaction record | `user_id`, `category_id`, `type`, `amount`, `date` (Indexed) |
| **`income`** | Income entries | `user_id`, `amount`, `source`, `description`, `date` |
| **`expenses`** | Expense entries | `user_id`, `amount`, `category_id`, `category_name`, `payment_method`, `date` |
| **`budgets`** | Monthly budget targets | `user_id`, `year`, `month` (Unique compound index), `categories: [{ category_id, allocated_amount }]` |
| **`savings_goals`** | Financial savings goals | `user_id`, `title`, `target_amount`, `current_amount`, `transactions: [{ amount, type, date }]` |
| **`notifications`** | User alerts & system notifications | `user_id`, `type`, `message`, `is_read` |
| **`audit_logs`** | Admin system action audit log | `admin_id`, `action`, `resource`, `details`, `created_at` |

---

## How to Initialize and Run MongoDB

### 1. Via MongoDB Shell (`mongosh`)
```bash
mongosh "mongodb://localhost:27017/finance_db" backend/database/schema.mongodb.js
```

### 2. Via VS Code MongoDB Extension
1. Open [`backend/database/playground-1.mongodb.js`](file:///c:/Users/acer/Documents/FINANCE/backend/database/playground-1.mongodb.js) or [`backend/database/schema.mongodb.js`](file:///c:/Users/acer/Documents/FINANCE/backend/database/schema.mongodb.js).
2. Click **Play / Run** in the top right corner of the VS Code editor panel.
