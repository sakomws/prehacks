"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, DollarSign, CreditCard, Target, PieChart } from "lucide-react"
import { ExpenseChart } from "@/components/expense-chart"
import { RecentTransactions } from "@/components/recent-transactions"
import { BudgetOverview } from "@/components/budget-overview"
import { InvestmentSummary } from "@/components/investment-summary"
import { analyticsApi, accountsApi } from "@/lib/api"

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("30d")
  const [stats, setStats] = useState([
    {
      name: "Total Balance",
      value: "$0.00",
      change: "0%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      name: "Monthly Income",
      value: "$0.00",
      change: "0%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      name: "Monthly Expenses",
      value: "$0.00",
      change: "0%",
      changeType: "negative" as const,
      icon: TrendingDown,
    },
    {
      name: "Credit Score",
      value: "782",
      change: "+15",
      changeType: "positive" as const,
      icon: CreditCard,
    },
  ])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [analytics, accounts] = await Promise.all([
          analyticsApi.getOverview(),
          accountsApi.getAll({ active: true })
        ])

        if (analytics && accounts) {
          const totalBalance = accounts.totalBalance || 0
          const currentIncome = analytics.currentMonth?.income || 0
          const currentExpenses = analytics.currentMonth?.expenses || 0
          const savingsRate = analytics.currentMonth?.savingsRate || 0

          setStats([
            {
              name: "Total Balance",
              value: `$${totalBalance.toLocaleString()}`,
              change: "+2.5%",
              changeType: "positive" as const,
              icon: DollarSign,
            },
            {
              name: "Monthly Income",
              value: `$${currentIncome.toLocaleString()}`,
              change: "+12.3%",
              changeType: "positive" as const,
              icon: TrendingUp,
            },
            {
              name: "Monthly Expenses",
              value: `$${currentExpenses.toLocaleString()}`,
              change: "-5.2%",
              changeType: "negative" as const,
              icon: TrendingDown,
            },
            {
              name: "Savings Rate",
              value: `${savingsRate.toFixed(1)}%`,
              change: "+2.1%",
              changeType: "positive" as const,
              icon: CreditCard,
            },
          ])
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here&apos;s your financial overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <p className={`text-xs flex items-center mt-1 ${
                stat.changeType === "positive" 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {stat.changeType === "positive" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Expense Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expense Trends</CardTitle>
                  <CardDescription>Your spending patterns over time</CardDescription>
                </div>
                <div className="flex space-x-2">
                  {["7d", "30d", "90d", "1y"].map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ExpenseChart timeRange={timeRange} />
            </CardContent>
          </Card>
        </div>

        {/* Budget Overview */}
        <div>
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Budget Overview
              </CardTitle>
              <CardDescription>Your monthly budget status</CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetOverview />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>

        {/* Investment Summary */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Investment Portfolio
            </CardTitle>
            <CardDescription>Your investment performance</CardDescription>
          </CardHeader>
          <CardContent>
            <InvestmentSummary />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
