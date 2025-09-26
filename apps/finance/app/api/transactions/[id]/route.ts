import { NextRequest, NextResponse } from 'next/server'

// Mock data - in production, this would come from a database
const transactions = [
  {
    id: 1,
    description: "Grocery Store",
    amount: -85.50,
    type: "expense",
    category: "Food",
    date: "2024-01-15",
    account: "Checking",
  },
  {
    id: 2,
    description: "Salary Deposit",
    amount: 3500.00,
    type: "income",
    category: "Salary",
    date: "2024-01-14",
    account: "Checking",
  },
  {
    id: 3,
    description: "Gas Station",
    amount: -45.20,
    type: "expense",
    category: "Transportation",
    date: "2024-01-13",
    account: "Credit Card",
  },
  {
    id: 4,
    description: "Rent Payment",
    amount: -1200.00,
    type: "expense",
    category: "Housing",
    date: "2024-01-12",
    account: "Checking",
  },
  {
    id: 5,
    description: "Coffee Shop",
    amount: -12.75,
    type: "expense",
    category: "Food",
    date: "2024-01-11",
    account: "Credit Card",
  },
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    const transaction = transactions.find(t => t.id === id)

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction' },
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
    const { description, amount, type, category, account, date } = body

    const transactionIndex = transactions.findIndex(t => t.id === id)

    if (transactionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Update transaction
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      description: description || transactions[transactionIndex].description,
      amount: amount !== undefined ? parseFloat(amount) : transactions[transactionIndex].amount,
      type: type || transactions[transactionIndex].type,
      category: category || transactions[transactionIndex].category,
      account: account || transactions[transactionIndex].account,
      date: date || transactions[transactionIndex].date
    }

    return NextResponse.json({
      success: true,
      data: transactions[transactionIndex]
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
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
    const transactionIndex = transactions.findIndex(t => t.id === id)

    if (transactionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    const deletedTransaction = transactions.splice(transactionIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedTransaction
    })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
