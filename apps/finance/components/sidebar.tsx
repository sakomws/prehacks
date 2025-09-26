"use client"
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  BarChart3,
  Wallet,
  Target,
  Receipt,
  PiggyBank
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "#", icon: Home, current: true },
  { name: "Transactions", href: "#", icon: Receipt, current: false },
  { name: "Budget", href: "#", icon: Target, current: false },
  { name: "Investments", href: "#", icon: TrendingUp, current: false },
  { name: "Accounts", href: "#", icon: Wallet, current: false },
  { name: "Analytics", href: "#", icon: BarChart3, current: false },
  { name: "Savings", href: "#", icon: PiggyBank, current: false },
  { name: "Settings", href: "#", icon: Settings, current: false },
]

export function Sidebar() {

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  FinanceTracker
                </h1>
              </div>
            </div>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  item.current
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                )}
              >
                <item.icon
                  className={cn(
                    item.current
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300",
                    "mr-3 flex-shrink-0 h-6 w-6"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
