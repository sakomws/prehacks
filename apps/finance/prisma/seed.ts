import { PrismaClient, AccountType, TransactionType, CategoryType, BudgetPeriod, InvestmentType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-food' },
      update: {},
      create: {
        id: 'cat-food',
        name: 'Food & Dining',
        type: CategoryType.EXPENSE,
        color: '#EF4444',
        icon: 'shopping-bag',
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-transport' },
      update: {},
      create: {
        id: 'cat-transport',
        name: 'Transportation',
        type: CategoryType.EXPENSE,
        color: '#3B82F6',
        icon: 'car',
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-housing' },
      update: {},
      create: {
        id: 'cat-housing',
        name: 'Housing',
        type: CategoryType.EXPENSE,
        color: '#10B981',
        icon: 'home',
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-salary' },
      update: {},
      create: {
        id: 'cat-salary',
        name: 'Salary',
        type: CategoryType.INCOME,
        color: '#059669',
        icon: 'dollar-sign',
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-entertainment' },
      update: {},
      create: {
        id: 'cat-entertainment',
        name: 'Entertainment',
        type: CategoryType.EXPENSE,
        color: '#8B5CF6',
        icon: 'music',
        userId: user.id,
      },
    }),
  ])

  // Create accounts
  const accounts = await Promise.all([
    prisma.account.upsert({
      where: { id: 'acc-checking' },
      update: {},
      create: {
        id: 'acc-checking',
        name: 'Chase Checking',
        type: AccountType.CHECKING,
        balance: 45231.89,
        accountNumber: '****1234',
        bank: 'Chase Bank',
        userId: user.id,
      },
    }),
    prisma.account.upsert({
      where: { id: 'acc-savings' },
      update: {},
      create: {
        id: 'acc-savings',
        name: 'Chase Savings',
        type: AccountType.SAVINGS,
        balance: 15000.00,
        accountNumber: '****5678',
        bank: 'Chase Bank',
        userId: user.id,
      },
    }),
    prisma.account.upsert({
      where: { id: 'acc-credit' },
      update: {},
      create: {
        id: 'acc-credit',
        name: 'Chase Credit Card',
        type: AccountType.CREDIT,
        balance: -2340.50,
        creditLimit: 10000,
        accountNumber: '****9012',
        bank: 'Chase Bank',
        userId: user.id,
      },
    }),
    prisma.account.upsert({
      where: { id: 'acc-investment' },
      update: {},
      create: {
        id: 'acc-investment',
        name: 'Wells Fargo Investment',
        type: AccountType.INVESTMENT,
        balance: 40000.00,
        accountNumber: '****3456',
        bank: 'Wells Fargo',
        userId: user.id,
      },
    }),
  ])

  // Create transactions
  const transactions = await Promise.all([
    prisma.transaction.upsert({
      where: { id: 'txn-1' },
      update: {},
      create: {
        id: 'txn-1',
        description: 'Grocery Store',
        amount: -85.50,
        type: TransactionType.EXPENSE,
        date: new Date('2024-01-15'),
        userId: user.id,
        accountId: accounts[0].id, // Checking
        categoryId: categories[0].id, // Food
      },
    }),
    prisma.transaction.upsert({
      where: { id: 'txn-2' },
      update: {},
      create: {
        id: 'txn-2',
        description: 'Salary Deposit',
        amount: 3500.00,
        type: TransactionType.INCOME,
        date: new Date('2024-01-14'),
        userId: user.id,
        accountId: accounts[0].id, // Checking
        categoryId: categories[3].id, // Salary
      },
    }),
    prisma.transaction.upsert({
      where: { id: 'txn-3' },
      update: {},
      create: {
        id: 'txn-3',
        description: 'Gas Station',
        amount: -45.20,
        type: TransactionType.EXPENSE,
        date: new Date('2024-01-13'),
        userId: user.id,
        accountId: accounts[2].id, // Credit Card
        categoryId: categories[1].id, // Transportation
      },
    }),
    prisma.transaction.upsert({
      where: { id: 'txn-4' },
      update: {},
      create: {
        id: 'txn-4',
        description: 'Rent Payment',
        amount: -1200.00,
        type: TransactionType.EXPENSE,
        date: new Date('2024-01-12'),
        userId: user.id,
        accountId: accounts[0].id, // Checking
        categoryId: categories[2].id, // Housing
      },
    }),
    prisma.transaction.upsert({
      where: { id: 'txn-5' },
      update: {},
      create: {
        id: 'txn-5',
        description: 'Coffee Shop',
        amount: -12.75,
        type: TransactionType.EXPENSE,
        date: new Date('2024-01-11'),
        userId: user.id,
        accountId: accounts[2].id, // Credit Card
        categoryId: categories[0].id, // Food
      },
    }),
  ])

  // Create budgets
  const budgets = await Promise.all([
    prisma.budget.upsert({
      where: { id: 'budget-food' },
      update: {},
      create: {
        id: 'budget-food',
        name: 'Food & Dining Budget',
        amount: 600,
        period: BudgetPeriod.MONTHLY,
        year: 2024,
        month: 1,
        userId: user.id,
        categoryId: categories[0].id,
      },
    }),
    prisma.budget.upsert({
      where: { id: 'budget-transport' },
      update: {},
      create: {
        id: 'budget-transport',
        name: 'Transportation Budget',
        amount: 400,
        period: BudgetPeriod.MONTHLY,
        year: 2024,
        month: 1,
        userId: user.id,
        categoryId: categories[1].id,
      },
    }),
    prisma.budget.upsert({
      where: { id: 'budget-housing' },
      update: {},
      create: {
        id: 'budget-housing',
        name: 'Housing Budget',
        amount: 1200,
        period: BudgetPeriod.MONTHLY,
        year: 2024,
        month: 1,
        userId: user.id,
        categoryId: categories[2].id,
      },
    }),
  ])

  // Create investments
  const investments = await Promise.all([
    prisma.investment.upsert({
      where: { id: 'inv-1' },
      update: {},
      create: {
        id: 'inv-1',
        name: 'Apple Inc.',
        symbol: 'AAPL',
        type: InvestmentType.STOCK,
        shares: 50,
        currentPrice: 150.00,
        totalValue: 7500,
        gain: 500,
        gainPercentage: 7.14,
        userId: user.id,
      },
    }),
    prisma.investment.upsert({
      where: { id: 'inv-2' },
      update: {},
      create: {
        id: 'inv-2',
        name: 'Microsoft Corp.',
        symbol: 'MSFT',
        type: InvestmentType.STOCK,
        shares: 30,
        currentPrice: 300.00,
        totalValue: 9000,
        gain: 600,
        gainPercentage: 7.14,
        userId: user.id,
      },
    }),
    prisma.investment.upsert({
      where: { id: 'inv-3' },
      update: {},
      create: {
        id: 'inv-3',
        name: 'S&P 500 ETF',
        symbol: 'SPY',
        type: InvestmentType.ETF,
        shares: 100,
        currentPrice: 400.00,
        totalValue: 40000,
        gain: 800,
        gainPercentage: 2.04,
        userId: user.id,
      },
    }),
    prisma.investment.upsert({
      where: { id: 'inv-4' },
      update: {},
      create: {
        id: 'inv-4',
        name: 'Bitcoin',
        symbol: 'BTC',
        type: InvestmentType.CRYPTO,
        amount: 0.5,
        currentPrice: 45000.00,
        totalValue: 22500,
        gain: 500,
        gainPercentage: 2.27,
        userId: user.id,
      },
    }),
  ])

  console.log('Database seeded successfully!')
  console.log('Created:', {
    user: user.email,
    categories: categories.length,
    accounts: accounts.length,
    transactions: transactions.length,
    budgets: budgets.length,
    investments: investments.length,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
