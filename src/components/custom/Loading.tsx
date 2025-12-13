import React from 'react'

function Loading() {
  return (
      <div className="flex min-h-screen items-center justify-center bg-app-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-app-gray-300 border-t-app-blue-600" />
          <p className="text-app-gray-600">Loading...</p>
        </div>
      </div>
  )
}

export default Loading