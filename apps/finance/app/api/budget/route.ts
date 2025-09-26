import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly'

    // For now, use a default user ID. In production, get from authentication
    const userId = 'test-user-id'

    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    // Get budgets for the specified period
    const budgets = await db.budget.findMany({
      where: {
        userId,
        period: period.toUpperCase() as 'MONTHLY' | 'YEARLY',
        year: period === 'yearly' ? year : undefined,
        month: period === 'monthly' ? month : undefined,
        isActive: true
      },
      include: {
        category: true
      }
    })

    // Get actual spending for each category
    const categories = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = period === 'yearly' 
          ? new Date(year, 0, 1)
          : new Date(year, month - 1, 1)
        
        const endDate = period === 'yearly'
          ? new Date(year, 11, 31)
          : new Date(year, month, 0)

        const spent = await db.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: {
            amount: true
          }
        })

        const spentAmount = Math.abs(spent._sum.amount || 0)

        return {
          name: budget.category.name,
          budget: budget.amount,
          spent: spentAmount,
          remaining: budget.amount - spentAmount,
          percentageUsed: budget.amount > 0 ? Math.round((spentAmount / budget.amount) * 100 * 100) / 100 : 0,
          isOverBudget: spentAmount > budget.amount
        }
      })
    )

    // Calculate totals
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0)
    const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0)
    const remaining = totalBudget - totalSpent
    const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        period,
        total: {
          budget: totalBudget,
          spent: totalSpent,
          remaining,
          percentageUsed: Math.round(percentageUsed * 100) / 100
        },
        categories
      }
    })
  } catch (error) {
    console.error('Error fetching budget:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budget' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { period, category, budget: newBudget } = body

    if (!period || !category || newBudget === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For now, use a default user ID. In production, get from authentication
    const userId = 'test-user-id'

    // Find the category
    const categoryRecord = await db.category.findFirst({
      where: {
        name: { contains: category },
        userId
      }
    })

    if (!categoryRecord) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    // Find the budget to update
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    const budget = await db.budget.findFirst({
      where: {
        userId,
        categoryId: categoryRecord.id,
        period: period.toUpperCase() as 'MONTHLY' | 'YEARLY',
        year: period === 'yearly' ? year : undefined,
        month: period === 'monthly' ? month : undefined,
        isActive: true
      }
    })

    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      )
    }

    // Update budget
    const updatedBudget = await db.budget.update({
      where: { id: budget.id },
      data: { amount: parseFloat(newBudget) },
      include: { category: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        name: updatedBudget.category.name,
        budget: updatedBudget.amount,
        period: updatedBudget.period.toLowerCase()
      }
    })
  } catch (error) {
    console.error('Error updating budget:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update budget' },
      { status: 500 }
    )
  }
}
