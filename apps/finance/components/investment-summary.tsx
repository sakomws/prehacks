"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

const investmentData = [
  { name: 'Stocks', value: 15000, color: '#3B82F6' },
  { name: 'Bonds', value: 8000, color: '#10B981' },
  { name: 'Crypto', value: 5000, color: '#F59E0B' },
  { name: 'Real Estate', value: 12000, color: '#8B5CF6' },
]

const performanceData = [
  { name: '1D', change: 2.5, positive: true },
  { name: '1W', change: -1.2, positive: false },
  { name: '1M', change: 8.7, positive: true },
  { name: '1Y', change: 15.3, positive: true },
]

export function InvestmentSummary() {
  const totalValue = investmentData.reduce((sum, item) => sum + item.value, 0)
  const totalGain = 2500 // Mock data
  const totalGainPercentage = (totalGain / (totalValue - totalGain)) * 100

  return (
    <div className="space-y-6">
      {/* Portfolio Value */}
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(totalValue)}
        </div>
        <div className={`text-sm flex items-center justify-center ${
          totalGain > 0 
            ? "text-green-600 dark:text-green-400" 
            : "text-red-600 dark:text-red-400"
        }`}>
          {totalGain > 0 ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          {totalGain > 0 ? "+" : ""}{formatCurrency(totalGain)} ({formatPercentage(totalGainPercentage)})
        </div>
      </div>

      {/* Portfolio Allocation Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={investmentData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {investmentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Value']}
              labelStyle={{ color: 'currentColor' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Asset Breakdown */}
      <div className="space-y-3">
        {investmentData.map((asset) => {
          const percentage = (asset.value / totalValue) * 100
          return (
            <div key={asset.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: asset.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {asset.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(asset.value)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatPercentage(percentage)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Performance Metrics */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          {performanceData.map((metric) => (
            <div key={metric.name} className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {metric.name}
              </div>
              <div className={`text-sm font-semibold ${
                metric.positive 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {metric.positive ? "+" : ""}{formatPercentage(metric.change)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
