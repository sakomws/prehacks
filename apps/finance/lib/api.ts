// API utility functions for FinanceTracker

const API_BASE = '/api'

export interface Transaction {
  id: number
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  account: string
  date: string
}

export interface Account {
  id: number
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  accountNumber: string
  bank: string
  isActive: boolean
  lastUpdated: string
  creditLimit?: number
}

export interface Investment {
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

export interface BudgetCategory {
  name: string
  budget: number
  spent: number
  remaining: number
  percentageUsed: number
  isOverBudget: boolean
}

export interface Budget {
  period: string
  total: {
    budget: number
    spent: number
    remaining: number
    percentageUsed: number
  }
  categories: BudgetCategory[]
}

// Transactions API
export const transactionsApi = {
  async getAll(filters?: { type?: string; category?: string; limit?: number }) {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    
    const response = await fetch(`${API_BASE}/transactions?${params}`)
    const data = await response.json()
    return data.success ? data.data : []
  },

  async create(transaction: Omit<Transaction, 'id'>) {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    })
    const data = await response.json()
    return data.success ? data.data : null
  },

  async update(id: number, transaction: Partial<Transaction>) {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    })
    const data = await response.json()
    return data.success ? data.data : null
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    return data.success
  }
}

// Budget API
export const budgetApi = {
  async get(period: 'monthly' | 'yearly' = 'monthly'): Promise<Budget | null> {
    const response = await fetch(`${API_BASE}/budget?period=${period}`)
    const data = await response.json()
    return data.success ? data.data : null
  },

  async updateCategory(period: 'monthly' | 'yearly', category: string, budget: number) {
    const response = await fetch(`${API_BASE}/budget`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, category, budget })
    })
    const data = await response.json()
    return data.success ? data.data : null
  }
}

// Investments API
export const investmentsApi = {
  async getPortfolio() {
    const response = await fetch(`${API_BASE}/investments?type=portfolio`)
    const data = await response.json()
    return data.success ? data.data : null
  },

  async getPerformance() {
    const response = await fetch(`${API_BASE}/investments?type=performance`)
    const data = await response.json()
    return data.success ? data.data : null
  },

  async add(investment: Omit<Investment, 'id' | 'totalValue' | 'gain' | 'gainPercentage' | 'allocationPercentage'>) {
    const response = await fetch(`${API_BASE}/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(investment)
    })
    const data = await response.json()
    return data.success ? data.data : null
  }
}

// Accounts API
export const accountsApi = {
  async getAll(filters?: { type?: string; active?: boolean }) {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.active !== undefined) params.append('active', filters.active.toString())
    
    const response = await fetch(`${API_BASE}/accounts?${params}`)
    const data = await response.json()
    return data.success ? data.data : null
  },

  async create(account: Omit<Account, 'id' | 'lastUpdated'>) {
    const response = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    })
    const data = await response.json()
    return data.success ? data.data : null
  },

  async update(id: number, account: Partial<Account>) {
    const response = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    })
    const data = await response.json()
    return data.success ? data.data : null
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    return data.success
  }
}

// Analytics API
export const analyticsApi = {
  async getOverview() {
    const response = await fetch(`${API_BASE}/analytics?type=overview`)
    const data = await response.json()
    return data.success ? data.data : null
  },

  async getExpenses() {
    const response = await fetch(`${API_BASE}/analytics?type=expenses`)
    const data = await response.json()
    return data.success ? data.data : null
  },

  async getIncome() {
    const response = await fetch(`${API_BASE}/analytics?type=income`)
    const data = await response.json()
    return data.success ? data.data : null
  },

  async getSavings() {
    const response = await fetch(`${API_BASE}/analytics?type=savings`)
    const data = await response.json()
    return data.success ? data.data : null
  },

  async getCategories() {
    const response = await fetch(`${API_BASE}/analytics?type=categories`)
    const data = await response.json()
    return data.success ? data.data : null
  }
}
