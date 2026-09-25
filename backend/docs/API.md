# API Documentation

## Base URL
`http://localhost:8000/api`

## Interactive Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password with token

### Transactions & CRUD (`/api`)
- `GET /api/income` - List user income entries
- `POST /api/income` - Create income entry
- `PUT /api/income/{id}` - Update income entry
- `DELETE /api/income/{id}` - Delete income entry
- `GET /api/expenses` - List user expense entries
- `POST /api/expenses` - Create expense entry
- `PUT /api/expenses/{id}` - Update expense entry
- `DELETE /api/expenses/{id}` - Delete expense entry
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create transaction

### Budget & Savings (`/api`)
- `GET /api/budgets` - Get current/monthly budget
- `POST /api/budgets` - Create or update budget
- `GET /api/budgets/{id}/details` - Budget usage details
- `GET /api/savings` - List savings goals
- `POST /api/savings` - Create savings goal
- `POST /api/savings/{id}/add` - Deposit to savings goal
- `POST /api/savings/{id}/withdraw` - Withdraw from savings goal

### Analytics & Reports (`/api`)
- `GET /api/analytics/summary` - Financial summary metrics
- `GET /api/analytics/monthly` - Monthly comparison metrics
- `GET /api/analytics/daily` - Daily transaction breakdown
- `GET /api/analytics/categories` - Category distribution
- `GET /api/analytics/trends` - Financial trends analysis
- `GET /api/reports/monthly` - Monthly report generation (JSON / CSV)

### Admin (`/api/admin`)
- `GET /api/admin/statistics` - Platform statistics
- `GET /api/admin/users` - Manage users
- `PUT /api/admin/users/{id}/status` - Activate/deactivate user
- `DELETE /api/admin/users/{id}` - Delete user
- `GET /api/admin/transactions` - Monitor all transactions
- `GET /api/admin/audit-logs` - View system audit logs
