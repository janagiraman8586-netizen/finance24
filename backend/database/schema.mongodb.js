/* global use, db */
/**
 * Finance Management System - MongoDB Database Schema & Initializer
 * Target Database: finance_db
 * Compatible with MongoDB Shell (mongosh) & VS Code MongoDB Playground
 */

// 1. Select the database
use('finance_db');

// Drop collections if resetting (uncomment if clean reset needed)
// db.users.drop();
// db.categories.drop();
// db.payment_methods.drop();
// db.transactions.drop();
// db.income.drop();
// db.expenses.drop();
// db.budgets.drop();
// db.savings_goals.drop();
// db.notifications.drop();
// db.audit_logs.drop();

print("Initializing finance_db MongoDB schema and indexes...");

// ==========================================
// 2. CREATE COLLECTIONS WITH SCHEMA VALIDATION
// ==========================================

// --- USERS COLLECTION ---
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'username', 'hashed_password', 'roles', 'is_active'],
      properties: {
        email: { bsonType: 'string', description: 'User email - required unique' },
        username: { bsonType: 'string', description: 'Username - required unique' },
        hashed_password: { bsonType: 'string', description: 'Bcrypt hashed password' },
        first_name: { bsonType: 'string' },
        last_name: { bsonType: 'string' },
        roles: { bsonType: 'array', items: { bsonType: 'string' } },
        is_active: { bsonType: 'bool' },
        last_login: { bsonType: 'date' },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

// Users Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ is_active: 1 });

// --- CATEGORIES COLLECTION ---
db.createCollection('categories');
db.categories.createIndex({ name: 1 }, { unique: true });
db.categories.createIndex({ type: 1 });

// --- PAYMENT METHODS COLLECTION ---
db.createCollection('payment_methods');
db.payment_methods.createIndex({ name: 1 }, { unique: true });

// --- TRANSACTIONS COLLECTION ---
db.createCollection('transactions');
db.transactions.createIndex({ user_id: 1, date: -1 });
db.transactions.createIndex({ category_id: 1 });
db.transactions.createIndex({ type: 1 });

// --- INCOME COLLECTION ---
db.createCollection('income');
db.income.createIndex({ user_id: 1, date: -1 });

// --- EXPENSES COLLECTION ---
db.createCollection('expenses');
db.expenses.createIndex({ user_id: 1, date: -1 });
db.expenses.createIndex({ category_id: 1 });

// --- BUDGETS COLLECTION ---
db.createCollection('budgets');
db.budgets.createIndex({ user_id: 1, year: 1, month: 1 }, { unique: true });

// --- SAVINGS GOALS COLLECTION ---
db.createCollection('savings_goals');
db.savings_goals.createIndex({ user_id: 1, status: 1 });

// --- NOTIFICATIONS COLLECTION ---
db.createCollection('notifications');
db.notifications.createIndex({ user_id: 1, is_read: 1 });

// --- AUDIT LOGS COLLECTION ---
db.createCollection('audit_logs');
db.audit_logs.createIndex({ admin_id: 1, created_at: -1 });

print("Indexes created successfully!");

// ==========================================
// 3. SEED INITIAL DATA
// ==========================================

// Seed Payment Methods
db.payment_methods.insertMany([
  { name: 'Cash' },
  { name: 'UPI' },
  { name: 'Debit Card' },
  { name: 'Credit Card' },
  { name: 'Bank Transfer' },
  { name: 'Net Banking' },
  { name: 'Other' }
]);

// Seed Categories
const categoryDocs = db.categories.insertMany([
  { name: 'Food & Dining', type: 'expense', icon: '🍔', created_at: new Date() },
  { name: 'Transportation', type: 'expense', icon: '🚗', created_at: new Date() },
  { name: 'Shopping', type: 'expense', icon: '🛍️', created_at: new Date() },
  { name: 'Utilities & Bills', type: 'expense', icon: '⚡', created_at: new Date() },
  { name: 'Entertainment', type: 'expense', icon: '🎬', created_at: new Date() },
  { name: 'Healthcare', type: 'expense', icon: '🏥', created_at: new Date() },
  { name: 'Housing & Rent', type: 'expense', icon: '🏠', created_at: new Date() },
  { name: 'Education', type: 'expense', icon: '📚', created_at: new Date() },
  { name: 'Travel', type: 'expense', icon: '✈️', created_at: new Date() },
  { name: 'Salary', type: 'income', icon: '💰', created_at: new Date() },
  { name: 'Freelance', type: 'income', icon: '💻', created_at: new Date() },
  { name: 'Business', type: 'income', icon: '💼', created_at: new Date() },
  { name: 'Investments', type: 'income', icon: '📈', created_at: new Date() },
  { name: 'Other Income', type: 'income', icon: '🎁', created_at: new Date() }
]);

// Seed Users
// Standard User (Password: Password123!)
const regularUserRes = db.users.insertOne({
  email: 'user@example.com',
  username: 'john_doe',
  hashed_password: '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
  first_name: 'John',
  last_name: 'Doe',
  roles: ['User'],
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
});

// Admin User (Password: Admin123!)
db.users.insertOne({
  email: 'admin@example.com',
  username: 'admin_user',
  hashed_password: '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
  first_name: 'Admin',
  last_name: 'System',
  roles: ['Admin', 'User'],
  is_active: true,
  created_at: new Date(),
  updated_at: new Date()
});

const userId = regularUserRes.insertedId;
const foodCategoryId = Object.values(categoryDocs.insertedIds)[0];
const transCategoryId = Object.values(categoryDocs.insertedIds)[1];
const utilCategoryId = Object.values(categoryDocs.insertedIds)[3];

// Seed Sample Income
db.income.insertMany([
  {
    user_id: userId,
    amount: 75000.00,
    source: 'Salary',
    description: 'Software Engineer Salary',
    date: new Date(),
    created_at: new Date()
  },
  {
    user_id: userId,
    amount: 15000.00,
    source: 'Freelance',
    description: 'Web Design Project',
    date: new Date(),
    created_at: new Date()
  }
]);

// Seed Sample Expenses
db.expenses.insertMany([
  {
    user_id: userId,
    amount: 1850.00,
    category_id: foodCategoryId,
    category_name: 'Food & Dining',
    description: 'Weekly Grocery',
    payment_method: 'UPI',
    date: new Date(),
    created_at: new Date()
  },
  {
    user_id: userId,
    amount: 650.00,
    category_id: transCategoryId,
    category_name: 'Transportation',
    description: 'Fuel Refill',
    payment_method: 'Credit Card',
    date: new Date(),
    created_at: new Date()
  },
  {
    user_id: userId,
    amount: 3200.00,
    category_id: utilCategoryId,
    category_name: 'Utilities & Bills',
    description: 'Internet Bill',
    payment_method: 'Net Banking',
    date: new Date(),
    created_at: new Date()
  }
]);

// Seed Sample Budget
db.budgets.insertOne({
  user_id: userId,
  month: 8,
  year: 2026,
  total_amount: 45000.00,
  categories: [
    { category_id: foodCategoryId, category_name: 'Food & Dining', allocated_amount: 12000.00 },
    { category_id: transCategoryId, category_name: 'Transportation', allocated_amount: 5000.00 },
    { category_id: utilCategoryId, category_name: 'Utilities & Bills', allocated_amount: 8000.00 }
  ],
  created_at: new Date(),
  updated_at: new Date()
});

// Seed Sample Savings Goal
db.savings_goals.insertOne({
  user_id: userId,
  title: 'Emergency Reserve Fund',
  target_amount: 150000.00,
  current_amount: 45000.00,
  target_date: new Date('2027-08-01T00:00:00Z'),
  status: 'active',
  transactions: [
    { amount: 20000.00, type: 'deposit', date: new Date() },
    { amount: 25000.00, type: 'deposit', date: new Date() }
  ],
  created_at: new Date(),
  updated_at: new Date()
});

print("[SUCCESS] MongoDB finance_db database initialized and seeded successfully!");
