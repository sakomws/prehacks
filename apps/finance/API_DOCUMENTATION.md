# FinanceTracker API Documentation

This document describes the REST API endpoints for the FinanceTracker application.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API does not require authentication. In production, you would implement JWT tokens or session-based authentication.

## API Endpoints

### Transactions

#### GET /api/transactions
Retrieve all transactions with optional filtering.

**Query Parameters:**
- `type` (optional): Filter by transaction type (`income` or `expense`)
- `category` (optional): Filter by category (e.g., `Food`, `Transportation`)
- `limit` (optional): Limit number of results

**Example Request:**
```bash
GET /api/transactions?type=expense&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "description": "Grocery Store",
      "amount": -85.50,
      "type": "expense",
      "category": "Food",
      "date": "2024-01-15",
      "account": "Checking"
    }
  ],
  "total": 1
}
```

#### POST /api/transactions
Create a new transaction.

**Request Body:**
```json
{
  "description": "Coffee Shop",
  "amount": -12.75,
  "type": "expense",
  "category": "Food",
  "account": "Credit Card",
  "date": "2024-01-16"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 6,
    "description": "Coffee Shop",
    "amount": -12.75,
    "type": "expense",
    "category": "Food",
    "account": "Credit Card",
    "date": "2024-01-16"
  }
}
```

#### GET /api/transactions/[id]
Retrieve a specific transaction by ID.

#### PUT /api/transactions/[id]
Update a specific transaction.

#### DELETE /api/transactions/[id]
Delete a specific transaction.

### Budget

#### GET /api/budget
Retrieve budget information.

**Query Parameters:**
- `period` (optional): Budget period (`monthly` or `yearly`). Defaults to `monthly`.

**Example Request:**
```bash
GET /api/budget?period=monthly
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "total": {
      "budget": 5000,
      "spent": 3230,
      "remaining": 1770,
      "percentageUsed": 64.6
    },
    "categories": [
      {
        "name": "Food & Dining",
        "budget": 600,
        "spent": 450,
        "remaining": 150,
        "percentageUsed": 75.0,
        "isOverBudget": false
      }
    ]
  }
}
```

#### PUT /api/budget
Update budget for a specific category.

**Request Body:**
```json
{
  "period": "monthly",
  "category": "Food & Dining",
  "budget": 700
}
```

### Investments

#### GET /api/investments
Retrieve investment portfolio information.

**Query Parameters:**
- `type` (optional): Data type (`portfolio` or `performance`). Defaults to `portfolio`.

**Example Request:**
```bash
GET /api/investments?type=portfolio
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalValue": 40000,
    "totalGain": 2500,
    "totalGainPercentage": 6.67,
    "assets": [
      {
        "id": 1,
        "name": "Apple Inc.",
        "symbol": "AAPL",
        "shares": 50,
        "currentPrice": 150.00,
        "totalValue": 7500,
        "gain": 500,
        "gainPercentage": 7.14,
        "type": "Stock",
        "allocationPercentage": 18.75
      }
    ]
  }
}
```

#### POST /api/investments
Add a new investment to the portfolio.

**Request Body:**
```json
{
  "name": "Tesla Inc.",
  "symbol": "TSLA",
  "shares": 10,
  "currentPrice": 200.00,
  "type": "Stock"
}
```

### Analytics

#### GET /api/analytics
Retrieve financial analytics and insights.

**Query Parameters:**
- `type` (optional): Analytics type (`overview`, `expenses`, `income`, `savings`, `categories`). Defaults to `overview`.
- `period` (optional): Time period (`monthly` or `yearly`). Defaults to `monthly`.

**Example Request:**
```bash
GET /api/analytics?type=overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentMonth": {
      "income": 8500,
      "expenses": 4300,
      "savings": 4200,
      "savingsRate": 49.41
    },
    "trends": {
      "expenseGrowth": 12.5,
      "incomeGrowth": 0,
      "savingsGrowth": 8.2
    },
    "topCategories": [
      {
        "name": "Housing",
        "amount": 8400,
        "percentage": 27.6
      }
    ],
    "budgetCompliance": [
      {
        "name": "Food",
        "budget": 600,
        "spent": 686,
        "compliance": 114.3
      }
    ]
  }
}
```

### Accounts

#### GET /api/accounts
Retrieve all financial accounts.

**Query Parameters:**
- `type` (optional): Filter by account type (`checking`, `savings`, `credit`, `investment`)
- `active` (optional): Filter by active status (`true` or `false`)

**Example Request:**
```bash
GET /api/accounts?type=checking&active=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accounts": [
      {
        "id": 1,
        "name": "Chase Checking",
        "type": "checking",
        "balance": 45231.89,
        "accountNumber": "****1234",
        "bank": "Chase Bank",
        "isActive": true,
        "lastUpdated": "2024-01-15T10:30:00Z"
      }
    ],
    "totalBalance": 45231.89,
    "count": 1
  }
}
```

#### POST /api/accounts
Create a new account.

**Request Body:**
```json
{
  "name": "New Savings Account",
  "type": "savings",
  "balance": 5000.00,
  "accountNumber": "****9999",
  "bank": "Wells Fargo"
}
```

#### GET /api/accounts/[id]
Retrieve a specific account by ID.

#### PUT /api/accounts/[id]
Update a specific account.

#### DELETE /api/accounts/[id]
Delete a specific account.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found
- `500` - Internal Server Error

## Data Models

### Transaction
```typescript
interface Transaction {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  account: string
  date: string
}
```

### Account
```typescript
interface Account {
  id: number
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  accountNumber: string
  bank: string
  isActive: boolean
  lastUpdated: string
  creditLimit?: number // Only for credit accounts
}
```

### Investment
```typescript
interface Investment {
  id: number
  name: string
  symbol: string
  shares: number
  currentPrice: number
  totalValue: number
  gain: number
  gainPercentage: number
  type: 'Stock' | 'ETF' | 'Crypto' | 'Bond'
  allocationPercentage?: number
}
```

## Usage Examples

### Fetching Recent Transactions
```javascript
const response = await fetch('/api/transactions?limit=5')
const data = await response.json()
console.log(data.data) // Array of 5 most recent transactions
```

### Creating a New Expense
```javascript
const newExpense = {
  description: "Lunch",
  amount: -15.50,
  type: "expense",
  category: "Food",
  account: "Credit Card"
}

const response = await fetch('/api/transactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(newExpense)
})

const result = await response.json()
console.log(result.data) // New transaction object
```

### Getting Budget Overview
```javascript
const response = await fetch('/api/budget?period=monthly')
const data = await response.json()
console.log(`Budget used: ${data.data.total.percentageUsed}%`)
```

## Notes

- All monetary amounts are in USD
- Dates are in ISO 8601 format (YYYY-MM-DD)
- The API currently uses mock data. In production, you would connect to a real database
- All endpoints support CORS for cross-origin requests
- Rate limiting should be implemented in production
