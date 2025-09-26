import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const active = searchParams.get('active')

    // For now, use a default user ID. In production, get from authentication
    const userId = 'test-user-id'

    const where: { userId: string; type?: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'CASH' | 'LOAN'; isActive?: boolean } = { userId }

    if (type) {
      where.type = type.toUpperCase() as 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'CASH' | 'LOAN'
    }

    if (active === 'true') {
      where.isActive = true
    }

    const accounts = await db.account.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => {
      return sum + account.balance
    }, 0)

    // Format the response
    const formattedAccounts = accounts.map(account => ({
      id: account.id,
      name: account.name,
      type: account.type.toLowerCase(),
      balance: account.balance,
      accountNumber: account.accountNumber,
      bank: account.bank,
      isActive: account.isActive,
      lastUpdated: account.lastUpdated.toISOString(),
      creditLimit: account.creditLimit
    }))

    return NextResponse.json({
      success: true,
      data: {
        accounts: formattedAccounts,
        totalBalance: Math.round(totalBalance * 100) / 100,
        count: formattedAccounts.length
      }
    })
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, balance, accountNumber, bank, creditLimit } = body

    // Validate required fields
    if (!name || !type || balance === undefined || !accountNumber || !bank) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For now, use a default user ID. In production, get from authentication
    const userId = 'test-user-id'

    // Create new account
    const newAccount = await db.account.create({
      data: {
        name,
        type: type.toUpperCase() as 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'INVESTMENT' | 'CASH' | 'LOAN',
        balance: parseFloat(balance),
        accountNumber,
        bank,
        isActive: true,
        userId,
        ...(type.toLowerCase() === 'credit' && creditLimit && { creditLimit: parseFloat(creditLimit) })
      }
    })

    // Format the response
    const formattedAccount = {
      id: newAccount.id,
      name: newAccount.name,
      type: newAccount.type.toLowerCase(),
      balance: newAccount.balance,
      accountNumber: newAccount.accountNumber,
      bank: newAccount.bank,
      isActive: newAccount.isActive,
      lastUpdated: newAccount.lastUpdated.toISOString(),
      creditLimit: newAccount.creditLimit
    }

    return NextResponse.json({
      success: true,
      data: formattedAccount
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
