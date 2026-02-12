import { Camera, Plus, MoreHorizontal } from 'lucide-react'
import SettingsLayout from '@/components/SettingsLayout'

const socialLinks = [
  { platform: 'Instagram', prefix: 'instagram.com/', value: 'sakom' },
  { platform: 'X (Twitter)', prefix: 'x.com/', value: 'sakom_dev' },
  { platform: 'YouTube', prefix: 'youtube.com/@', value: 'sakom' },
  { platform: 'LinkedIn', prefix: 'linkedin.com/in/', value: 'sako-mammadov' },
  { platform: 'GitHub', prefix: 'github.com/', value: 'sakom' },
  { platform: 'Website', prefix: 'https://', value: 'sako.dev' }
]

export default function AccountSettingsPage() {
  return (
    <SettingsLayout>
      <div className="space-y-12">
        {/* Your Profile */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Profile</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Sako"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Mammadov"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500">
                      @
                    </span>
                    <input
                      type="text"
                      defaultValue="sakom"
                      className="flex-1 px-4 py-3 bg-gray-50 rounded-r-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    defaultValue="60+ hackathons in last 2y | Platform Engineer @ Gladly"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow">
                    <Camera className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((link, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {link.platform}
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500">
                        {link.prefix}
                      </span>
                      <input
                        type="text"
                        defaultValue={link.value}
                        className="flex-1 px-4 py-3 bg-gray-50 rounded-r-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Emails */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Emails</h2>
            <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Email</span>
            </button>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-900">sako@gladly.com</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Primary
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This is your primary email for notifications and account recovery
                </p>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Phone Number</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            <p className="text-gray-500">Phone number settings coming soon...</p>
          </div>
        </div>
      </div>
    </SettingsLayout>
  )
}