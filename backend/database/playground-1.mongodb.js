/* global use, db */
// MongoDB Playground for Finance Management System
// Target Database: finance_db

use('finance_db');

// Run quick queries to inspect MongoDB data:

console.log("=== USERS ===");
console.log(db.getCollection('users').find({}, { hashed_password: 0 }).toArray());

console.log("=== EXPENSES SUMMARY BY CATEGORY ===");
console.log(
  db.getCollection('expenses').aggregate([
    {
      $group: {
        _id: '$category_name',
        totalSpent: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalSpent: -1 } }
  ]).toArray()
);

console.log("=== ACTIVE SAVINGS GOALS ===");
console.log(db.getCollection('savings_goals').find({ status: 'active' }).toArray());
