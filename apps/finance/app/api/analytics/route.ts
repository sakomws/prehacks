import { NextRequest, NextResponse } from 'next/server'

// Mock analytics data - in production, this would be calculated from database
const analytics = {
  expenses: {
    monthly: [
      { month: "Jan", amount: 2400, categories: { "Food": 600, "Transportation": 400, "Entertainment": 200, "Shopping": 300, "Utilities": 200, "Housing": 1200 } },
      { month: "Feb", amount: 1398, categories: { "Food": 500, "Transportation": 350, "Entertainment": 150, "Shopping": 200, "Utilities": 198, "Housing": 1200 } },
      { month: "Mar", amount: 9800, categories: { "Food": 800, "Transportation": 500, "Entertainment": 300, "Shopping": 200, "Utilities": 200, "Housing": 1200, "Healthcare": 2000, "Travel": 5000 } },
      { month: "Apr", amount: 3908, categories: { "Food": 700, "Transportation": 450, "Entertainment": 250, "Shopping": 400, "Utilities": 208, "Housing": 1200, "Healthcare": 700 } },
      { month: "May", amount: 4800, categories: { "Food": 750, "Transportation": 500, "Entertainment": 300, "Shopping": 500, "Utilities": 250, "Housing": 1200, "Healthcare": 300 } },
      { month: "Jun", amount: 3800, categories: { "Food": 650, "Transportation": 400, "Entertainment": 200, "Shopping": 350, "Utilities": 200, "Housing": 1200, "Healthcare": 800 } },
      { month: "Jul", amount: 4300, categories: { "Food": 800, "Transportation": 450, "Entertainment": 350, "Shopping": 400, "Utilities": 300, "Housing": 1200, "Healthcare": 200 } }
    ],
    trends: {
      averageMonthly: 4343,
      highestMonth: "Mar",
      lowestMonth: "Feb",
      growthRate: 12.5
    }
  },
  income: {
    monthly: [
      { month: "Jan", amount: 8500 },
      { month: "Feb", amount: 8500 },
      { month: "Mar", amount: 8500 },
      { month: "Apr", amount: 8500 },
      { month: "May", amount: 8500 },
      { month: "Jun", amount: 8500 },
      { month: "Jul", amount: 8500 }
    ],
    trends: {
      averageMonthly: 8500,
      growthRate: 0,
      isStable: true
    }
  },
  savings: {
    monthly: [
      { month: "Jan", amount: 6100 },
      { month: "Feb", amount: 7102 },
      { month: "Mar", amount: -1300 },
      { month: "Apr", amount: 4592 },
      { month: "May", amount: 3700 },
      { month: "Jun", amount: 4700 },
      { month: "Jul", amount: 4200 }
    ],
    trends: {
      averageMonthly: 4156,
      totalSaved: 29094,
      growthRate: 8.2
    }
  },
  categories: {
    topSpending: [
      { name: "Housing", amount: 8400, percentage: 27.6 },
      { name: "Food", amount: 4800, percentage: 15.8 },
      { name: "Transportation", amount: 3100, percentage: 10.2 },
      { name: "Healthcare", amount: 4000, percentage: 13.2 },
      { name: "Shopping", amount: 2350, percentage: 7.7 }
    ],
    budgetCompliance: [
      { name: "Housing", budget: 1200, spent: 1200, compliance: 100 },
      { name: "Food", budget: 600, spent: 686, compliance: 114.3 },
      { name: "Transportation", budget: 400, spent: 443, compliance: 110.8 },
      { name: "Entertainment", budget: 200, spent: 200, compliance: 100 },
      { name: "Shopping", budget: 300, spent: 336, compliance: 112 }
    ]
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'expenses':
        return NextResponse.json({
          success: true,
          data: analytics.expenses
        })

      case 'income':
        return NextResponse.json({
          success: true,
          data: analytics.income
        })

      case 'savings':
        return NextResponse.json({
          success: true,
          data: analytics.savings
        })

      case 'categories':
        return NextResponse.json({
          success: true,
          data: analytics.categories
        })

      case 'overview':
      default:
        // Calculate key metrics
        const currentMonth = analytics.expenses.monthly[analytics.expenses.monthly.length - 1]
        const currentIncome = analytics.income.monthly[analytics.income.monthly.length - 1]
        const currentSavings = analytics.savings.monthly[analytics.savings.monthly.length - 1]

        const overview = {
          currentMonth: {
            income: currentIncome.amount,
            expenses: currentMonth.amount,
            savings: currentSavings.amount,
            savingsRate: Math.round((currentSavings.amount / currentIncome.amount) * 100 * 100) / 100
          },
          trends: {
            expenseGrowth: analytics.expenses.trends.growthRate,
            incomeGrowth: analytics.income.trends.growthRate,
            savingsGrowth: analytics.savings.trends.growthRate
          },
          topCategories: analytics.categories.topSpending.slice(0, 3),
          budgetCompliance: analytics.categories.budgetCompliance.filter(cat => cat.compliance > 100)
        }

        return NextResponse.json({
          success: true,
          data: overview
        })
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
