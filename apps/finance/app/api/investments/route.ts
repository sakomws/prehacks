import { NextRequest, NextResponse } from 'next/server'

// Mock investment data - in production, this would come from a database
const investments = {
  portfolio: {
    totalValue: 40000,
    totalGain: 2500,
    totalGainPercentage: 6.67,
    assets: [
      {
        id: 1,
        name: "Apple Inc.",
        symbol: "AAPL",
        shares: 50,
        currentPrice: 150.00,
        totalValue: 7500,
        gain: 500,
        gainPercentage: 7.14,
        type: "Stock"
      },
      {
        id: 2,
        name: "Microsoft Corp.",
        symbol: "MSFT",
        shares: 30,
        currentPrice: 300.00,
        totalValue: 9000,
        gain: 600,
        gainPercentage: 7.14,
        type: "Stock"
      },
      {
        id: 3,
        name: "S&P 500 ETF",
        symbol: "SPY",
        shares: 100,
        currentPrice: 400.00,
        totalValue: 40000,
        gain: 800,
        gainPercentage: 2.04,
        type: "ETF"
      },
      {
        id: 4,
        name: "Bitcoin",
        symbol: "BTC",
        amount: 0.5,
        currentPrice: 45000.00,
        totalValue: 22500,
        gain: 500,
        gainPercentage: 2.27,
        type: "Crypto"
      }
    ]
  },
  performance: {
    "1D": 2.5,
    "1W": -1.2,
    "1M": 8.7,
    "3M": 12.3,
    "1Y": 15.3,
    "5Y": 45.8
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'portfolio' or 'performance'

    if (type === 'performance') {
      return NextResponse.json({
        success: true,
        data: investments.performance
      })
    }

    // Calculate portfolio allocation
    const totalValue = investments.portfolio.totalValue
    const allocation = investments.portfolio.assets.map(asset => ({
      ...asset,
      allocationPercentage: Math.round((asset.totalValue / totalValue) * 100 * 100) / 100
    }))

    return NextResponse.json({
      success: true,
      data: {
        ...investments.portfolio,
        assets: allocation
      }
    })
  } catch (error) {
    console.error('Error fetching investments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch investments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, symbol, shares, currentPrice, type } = body

    // Validate required fields
    if (!name || !symbol || !shares || !currentPrice || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new investment
    const totalValue = shares * currentPrice
    const newInvestment = {
      id: investments.portfolio.assets.length + 1,
      name,
      symbol,
      shares: parseFloat(shares),
      currentPrice: parseFloat(currentPrice),
      totalValue,
      gain: 0, // New investment starts with 0 gain
      gainPercentage: 0,
      type
    }

    investments.portfolio.assets.push(newInvestment)
    investments.portfolio.totalValue += totalValue

    return NextResponse.json({
      success: true,
      data: newInvestment
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating investment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create investment' },
      { status: 500 }
    )
  }
}
