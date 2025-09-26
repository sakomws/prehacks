"use client"

import { Progress } from "@/components/ui/progress"
import { formatCurrency, formatPercentage } from "@/lib/utils"

const budgetCategories = [
  {
    name: "Food & Dining",
    spent: 450,
    budget: 600,
    color: "bg-red-500",
  },
  {
    name: "Transportation",
    spent: 280,
    budget: 400,
    color: "bg-blue-500",
  },
  {
    name: "Entertainment",
    spent: 120,
    budget: 200,
    color: "bg-purple-500",
  },
  {
    name: "Shopping",
    spent: 180,
    budget: 300,
    color: "bg-green-500",
  },
  {
    name: "Utilities",
    spent: 150,
    budget: 200,
    color: "bg-yellow-500",
  },
]

export function BudgetOverview() {
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0)
  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.budget, 0)
  const overallProgress = (totalSpent / totalBudget) * 100

  return (
    <div className="space-y-6">
      {/* Overall Budget Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Overall Budget</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
          </span>
        </div>
        <Progress value={overallProgress} className="h-2" />
        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
          {formatPercentage(overallProgress)} used
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Category Breakdown
        </h4>
        {budgetCategories.map((category) => {
          const percentage = (category.spent / category.budget) * 100
          const isOverBudget = percentage > 100
          
          return (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  {category.name}
                </span>
                <span className={`font-medium ${
                  isOverBudget 
                    ? "text-red-600 dark:text-red-400" 
                    : "text-gray-900 dark:text-white"
                }`}>
                  {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-1.5"
                />
                {isOverBudget && (
                  <div className="absolute top-0 right-0 text-xs text-red-600 dark:text-red-400 font-medium">
                    +{formatCurrency(category.spent - category.budget)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Budget Status */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Remaining Budget
          </span>
          <span className={`text-sm font-semibold ${
            totalBudget - totalSpent > 0 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          }`}>
            {formatCurrency(totalBudget - totalSpent)}
          </span>
        </div>
      </div>
    </div>
  )
}
