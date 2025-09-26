"use client"

import { useState, useEffect } from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowDownLeft, ShoppingBag, Car, Home, CreditCard, DollarSign } from "lucide-react"
import { transactionsApi, type Transaction } from "@/lib/api"

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food':
    case 'dining':
      return ShoppingBag
    case 'transportation':
    case 'gas':
      return Car
    case 'housing':
    case 'rent':
      return Home
    case 'salary':
    case 'income':
      return ArrowDownLeft
    case 'credit':
    case 'payment':
      return CreditCard
    default:
      return DollarSign
  }
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await transactionsApi.getAll({ limit: 5 })
        setTransactions(data || [])
      } catch (error) {
        console.error('Error loading transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No transactions found
        </div>
      ) : (
        transactions.map((transaction) => {
          const IconComponent = getCategoryIcon(transaction.category)
          return (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  transaction.type === "income" 
                    ? "bg-green-100 dark:bg-green-900" 
                    : "bg-red-100 dark:bg-red-900"
                }`}>
                  <IconComponent className={`h-4 w-4 ${
                    transaction.type === "income" 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.category} • {formatDate(new Date(transaction.date))}
                  </p>
                </div>
              </div>
              <div className={`font-semibold ${
                transaction.type === "income" 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {transaction.type === "income" ? "+" : ""}{formatCurrency(transaction.amount)}
              </div>
            </div>
          )
        })
      )}
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
          View all transactions
        </button>
      </div>
    </div>
  )
}
