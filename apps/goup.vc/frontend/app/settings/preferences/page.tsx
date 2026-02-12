import { Check, ChevronDown } from 'lucide-react'
import SettingsLayout from '@/components/SettingsLayout'

const themeOptions = [
  { name: 'System', description: 'Use system setting', selected: true },
  { name: 'Light', description: 'Light mode', selected: false },
  { name: 'Dark', description: 'Dark mode', selected: false }
]

const eventNotifications = [
  { icon: '📅', label: 'Event reminders', setting: 'Push' },
  { icon: '💬', label: 'Event comments', setting: 'Push' },
  { icon: '👥', label: 'New attendees', setting: 'Off' },
  { icon: '📝', label: 'Event updates', setting: 'Push' }
]

const hostNotifications = [
  { icon: '🎫', label: 'New registrations', setting: 'Push' },
  { icon: '❓', label: 'Questions from attendees', setting: 'Push' },
  { icon: '⭐', label: 'Event reviews', setting: 'Push' }
]

const calendarNotifications = [
  { icon: '📊', label: 'Analytics reports', setting: 'Off' },
  { icon: '👤', label: 'New subscribers', setting: 'Push' },
  { icon: '🔄', label: 'Calendar updates', setting: 'Push' }
]

export default function PreferencesPage() {
  return (
    <SettingsLayout>
      <div className="space-y-12">
        {/* Display */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Display</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {themeOptions.map((theme, index) => (
                  <div
                    key={index}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      theme.selected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-16 h-12 bg-gray-200 rounded-lg mx-auto mb-3"></div>
                      <div className="font-medium text-gray-900">{theme.name}</div>
                      <div className="text-sm text-gray-500">{theme.description}</div>
                    </div>
                    {theme.selected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Language</h3>
              <button className="flex items-center justify-between w-64 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <span>English (US)</span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notifications</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Events You Attend</h3>
              <div className="space-y-3">
                {eventNotifications.map((notification, index) => (
                  <div key={index} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{notification.icon}</span>
                      <span className="text-gray-900">{notification.label}</span>
                    </div>
                    <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                      <span>{notification.setting}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-black/5 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Events You Host</h3>
              <div className="space-y-3">
                {hostNotifications.map((notification, index) => (
                  <div key={index} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{notification.icon}</span>
                      <span className="text-gray-900">{notification.label}</span>
                    </div>
                    <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                      <span>{notification.setting}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-black/5 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendars You Manage</h3>
              <div className="space-y-3">
                {calendarNotifications.map((notification, index) => (
                  <div key={index} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{notification.icon}</span>
                      <span className="text-gray-900">{notification.label}</span>
                    </div>
                    <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                      <span>{notification.setting}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  )
}