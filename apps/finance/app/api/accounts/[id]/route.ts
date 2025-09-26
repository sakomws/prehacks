import { NextRequest, NextResponse } from 'next/server'

// Mock accounts data - in production, this would come from a database
const accounts = [
  {
    id: 1,
    name: "Chase Checking",
    type: "checking",
    balance: 45231.89,
    accountNumber: "****1234",
    bank: "Chase Bank",
    isActive: true,
    lastUpdated: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Chase Savings",
    type: "savings",
    balance: 15000.00,
    accountNumber: "****5678",
    bank: "Chase Bank",
    isActive: true,
    lastUpdated: "2024-01-15T10:30:00Z"
  },
  {
    id: 3,
    name: "Chase Credit Card",
    type: "credit",
    balance: -2340.50,
    creditLimit: 10000,
    accountNumber: "****9012",
    bank: "Chase Bank",
    isActive: true,
    lastUpdated: "2024-01-15T10:30:00Z"
  },
  {
    id: 4,
    name: "Wells Fargo Investment",
    type: "investment",
    balance: 40000.00,
    accountNumber: "****3456",
    bank: "Wells Fargo",
    isActive: true,
    lastUpdated: "2024-01-15T10:30:00Z"
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const account = accounts.find(a => a.id === id)

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: account
    })
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch account' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const body = await request.json()
    const { name, type, balance, accountNumber, bank, creditLimit, isActive } = body

    const accountIndex = accounts.findIndex(a => a.id === id)

    if (accountIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      )
    }

    // Update account
    accounts[accountIndex] = {
      ...accounts[accountIndex],
      name: name || accounts[accountIndex].name,
      type: type || accounts[accountIndex].type,
      balance: balance !== undefined ? parseFloat(balance) : accounts[accountIndex].balance,
      accountNumber: accountNumber || accounts[accountIndex].accountNumber,
      bank: bank || accounts[accountIndex].bank,
      isActive: isActive !== undefined ? isActive : accounts[accountIndex].isActive,
      lastUpdated: new Date().toISOString(),
      ...(type === 'credit' && creditLimit && { creditLimit: parseFloat(creditLimit) })
    }

    return NextResponse.json({
      success: true,
      data: accounts[accountIndex]
    })
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update account' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const accountIndex = accounts.findIndex(a => a.id === id)

    if (accountIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      )
    }

    const deletedAccount = accounts.splice(accountIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedAccount
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
