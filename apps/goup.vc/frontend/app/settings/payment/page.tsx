import { Plus, ChevronRight, CreditCard } from 'lucide-react'
import SettingsLayout from '@/components/SettingsLayout'

const calendars = [
  { name: 'Personal', avatar: '/avatars/personal.jpg' },
  { name: 'LPM Events', avatar: '/avatars/lpm.jpg' }
]

const paymentHistory = [
  {
    event: 'Startup Founders meetup',
    amount: '$2.00',
    date: 'Nov 15, 2024',
    method: 'visa'
  }
]

export default function PaymentPage() {
  return (
    <SettingsLayout>
      <div className="space-y-12">
        {/* Payment Methods */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Payment Methods</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            <p className="text-gray-600 mb-6">
              Securely manage your payment methods. All payments are processed through Stripe.
            </p>
            
            <button className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Card</span>
            </button>
          </div>
        </div>

        {/* Luma Plus */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Luma Plus</h2>
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <span>Learn More</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            <div className="space-y-4">
              {calendars.map((calendar, index) => (
                <div key={index} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <span className="font-medium text-gray-900">{calendar.name}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Payment History</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-black/5">
            {paymentHistory.map((payment, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{payment.event}</div>
                      <div className="text-sm text-gray-500">{payment.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{payment.amount}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-6 h-4 bg-blue-600 rounded text-xs text-white flex items-center justify-center font-bold">
                        VISA
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsLayout>
  )
}