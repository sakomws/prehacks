'use client'

import { useState } from 'react'
import { Camera, Eye, Download, X } from 'lucide-react'

interface ScreenshotGalleryProps {
  screenshots: string[]
}

export default function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)

  const openModal = (screenshot: string) => {
    setSelectedScreenshot(screenshot)
  }

  const closeModal = () => {
    setSelectedScreenshot(null)
  }

  const getScreenshotUrl = (filename: string) => {
    // Use the API route to serve screenshots
    return `/api/screenshots/${filename}`;
  };

  const downloadScreenshot = (screenshot: string) => {
    // Download the actual screenshot file
    const link = document.createElement('a');
    link.href = getScreenshotUrl(screenshot);
    link.download = screenshot;
    link.click();
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Screenshots</h2>
        <div className="flex items-center space-x-2">
          <Camera className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">{screenshots.length} taken</span>
        </div>
      </div>
      
      {screenshots.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No screenshots yet. The agent will capture screenshots during execution.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {screenshots.map((screenshot, index) => (
            <div
              key={index}
              className="relative group cursor-pointer"
              onClick={() => openModal(screenshot)}
            >
              <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 overflow-hidden hover:bg-gray-50 transition-colors">
                <img 
                  src={getScreenshotUrl(screenshot)} 
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load screenshot:', screenshot);
                    // Fallback to placeholder
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500 truncate px-2">
                      {screenshot}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-all duration-200">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal for viewing screenshots */}
      {selectedScreenshot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedScreenshot}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadScreenshot(selectedScreenshot)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="max-h-96 overflow-auto">
                <img 
                  src={getScreenshotUrl(selectedScreenshot)} 
                  alt={selectedScreenshot}
                  className="w-full h-auto rounded-lg border border-gray-200"
                  onError={(e) => {
                    console.error('Failed to load screenshot in modal:', selectedScreenshot);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-center py-8">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 mb-2">Screenshot Preview</p>
                  <p className="text-sm text-gray-500">
                    Failed to load screenshot image.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    File: {selectedScreenshot}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
