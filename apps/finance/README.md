# FinanceTracker - Personal Finance Management App

A comprehensive personal finance management application built with Next.js 15, React 19, and TypeScript. Track expenses, manage budgets, monitor investments, and gain insights into your financial health.

![FinanceTracker Dashboard](/public/dashboard-screenshot.png)

## 🚀 Features

### 💰 Financial Overview
- **Real-time Dashboard**: Comprehensive view of your financial status
- **Balance Tracking**: Monitor total balance, income, and expenses
- **Credit Score Monitoring**: Track your credit score improvements
- **Multi-account Support**: Manage multiple bank accounts and credit cards

### 📊 Expense Management
- **Transaction Tracking**: Record and categorize all financial transactions
- **Expense Analytics**: Visual charts showing spending patterns over time
- **Category Management**: Organize expenses by custom categories
- **Receipt Upload**: Attach receipts to transactions for better record keeping

### 🎯 Budget Planning
- **Monthly Budgets**: Set and track monthly spending limits
- **Category Budgets**: Allocate specific amounts to different expense categories
- **Budget Alerts**: Get notified when approaching budget limits
- **Progress Tracking**: Visual progress bars for budget adherence

### 📈 Investment Tracking
- **Portfolio Overview**: Track all your investments in one place
- **Asset Allocation**: Visual pie charts showing portfolio distribution
- **Performance Metrics**: Monitor returns across different time periods
- **Diversification Analysis**: Ensure proper portfolio diversification

### 📱 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Toggle between light and dark themes
- **Interactive Charts**: Beautiful, interactive financial visualizations
- **Intuitive Navigation**: Clean, organized interface for easy use

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Theme**: Next-themes for dark/light mode
- **Forms**: React Hook Form with Zod validation
- **Database**: Supabase (optional)

## 📁 Project Structure

```
finance/
├── app/                          # Next.js app directory
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   │   ├── card.tsx              # Card component
│   │   ├── button.tsx            # Button component
│   │   └── progress.tsx          # Progress bar component
│   ├── dashboard.tsx             # Main dashboard
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── header.tsx                # Top header
│   ├── expense-chart.tsx         # Expense visualization
│   ├── recent-transactions.tsx   # Transaction list
│   ├── budget-overview.tsx       # Budget tracking
│   ├── investment-summary.tsx    # Investment portfolio
│   └── theme-provider.tsx        # Theme management
├── lib/                          # Utility functions
│   └── utils.ts                  # Common utilities
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── next.config.js                # Next.js configuration
├── components.json               # Shadcn/ui configuration
└── README.md                     # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env.local` file for optional features:

```bash
# Supabase (for data persistence)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📱 Usage

### Dashboard
- View your financial overview at a glance
- Monitor key metrics like total balance, monthly income, and expenses
- Track your credit score and financial health

### Expense Tracking
- Add new transactions with categories and descriptions
- View recent transactions in chronological order
- Analyze spending patterns with interactive charts

### Budget Management
- Set monthly budgets for different categories
- Track progress with visual progress bars
- Get alerts when approaching budget limits

### Investment Portfolio
- Track all your investments in one place
- Monitor portfolio performance across different time periods
- Analyze asset allocation and diversification

## 🎨 Customization

### Themes
The app supports both light and dark themes. Toggle between them using the theme switcher in the header.

### Categories
Customize expense categories to match your spending habits:
- Food & Dining
- Transportation
- Entertainment
- Shopping
- Utilities
- And more...

### Charts
All charts are fully interactive and responsive. Hover over data points for detailed information.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
1. Build the project: `npm run build` or `yarn build`
2. Start production server: `npm start` or `yarn start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the component examples
- Open an issue on GitHub

## 🔄 Recent Updates

- ✅ Built comprehensive financial dashboard
- ✅ Added expense tracking and categorization
- ✅ Implemented budget management system
- ✅ Created investment portfolio tracking
- ✅ Added dark/light theme support
- ✅ Implemented responsive design
- ✅ Added interactive charts and visualizations
- ✅ Created modern, intuitive UI/UX
