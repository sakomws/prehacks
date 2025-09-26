import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    // For now, use a default user ID. In production, get from authentication
    const userId = 'test-user-id'

    const where: { userId: string; type?: 'INCOME' | 'EXPENSE' | 'TRANSFER'; category?: { name: { contains: string } } } = { userId }

    if (type) {
      where.type = type.toUpperCase() as 'INCOME' | 'EXPENSE' | 'TRANSFER'
    }

    if (category) {
      where.category = {
        name: {
          contains: category
        }
      }
    }

    const transactions = await db.transaction.findMany({
      where,
      include: {
        category: true,
        account: true
      },
      orderBy: {
        date: 'desc'
      },
      take: limit ? parseInt(limit) : undefined
    })

    // Transform the data to match the expected format
    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type.toLowerCase(),
      category: t.category.name,
      account: t.account.name,
      date: t.date.toISOString().split('T')[0]
    }))

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      total: formattedTransactions.length
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, amount, type, category, account, date } = body

    // Validate required fields
    if (!description || !amount || !type || !category || !account) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For now, use a default user ID. In production, get from authentication
    const userId = 'test-user-id'

    // Find category and account by name
    const categoryRecord = await db.category.findFirst({
      where: {
        name: { contains: category },
        userId
      }
    })

    const accountRecord = await db.account.findFirst({
      where: {
        name: { contains: account },
        userId
      }
    })

    if (!categoryRecord || !accountRecord) {
      return NextResponse.json(
        { success: false, error: 'Category or account not found' },
        { status: 404 }
      )
    }

    // Create new transaction
    const newTransaction = await db.transaction.create({
      data: {
        description,
        amount: parseFloat(amount),
        type: type.toUpperCase() as 'INCOME' | 'EXPENSE' | 'TRANSFER',
        date: date ? new Date(date) : new Date(),
        userId,
        categoryId: categoryRecord.id,
        accountId: accountRecord.id
      },
      include: {
        category: true,
        account: true
      }
    })

    // Format the response
    const formattedTransaction = {
      id: newTransaction.id,
      description: newTransaction.description,
      amount: newTransaction.amount,
      type: newTransaction.type.toLowerCase(),
      category: newTransaction.category.name,
      account: newTransaction.account.name,
      date: newTransaction.date.toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      data: formattedTransaction
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
