import React from 'react';
import { Download, Smartphone, X, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export function PWAPrompt() {
  const { isInstallable, isOffline, installApp, updateAvailable, updateApp } = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);
  const [showOfflineNotice, setShowOfflineNotice] = React.useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = React.useState(false);

  React.useEffect(() => {
    if (isInstallable) {
      // Show install prompt after 30 seconds
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable]);

  React.useEffect(() => {
    if (isOffline) {
      setShowOfflineNotice(true);
    } else {
      setShowOfflineNotice(false);
    }
  }, [isOffline]);

  React.useEffect(() => {
    if (updateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [updateAvailable]);

  const handleInstall = async () => {
    try {
      await installApp();
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleUpdate = () => {
    updateApp();
    setShowUpdatePrompt(false);
  };

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 bg-blue-500/20 p-2 rounded-lg">
              <Smartphone className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-zinc-100 mb-1">
                Install Kraken App
              </h3>
              <p className="text-xs text-zinc-400 mb-3">
                Install Kraken for faster access, offline messaging, and push notifications.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleInstall}
                  className="flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Install</span>
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="text-zinc-400 hover:text-zinc-100 px-3 py-1.5 rounded text-xs transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="flex-shrink-0 text-zinc-400 hover:text-zinc-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Offline Notice */}
      {showOfflineNotice && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-amber-900/90 border border-amber-700 rounded-lg shadow-lg z-50 p-3">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-100 font-medium">You're offline</p>
              <p className="text-xs text-amber-200">
                Messages will be sent when connection is restored
              </p>
            </div>
            <button
              onClick={() => setShowOfflineNotice(false)}
              className="text-amber-400 hover:text-amber-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Update Available */}
      {showUpdatePrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-green-900/90 border border-green-700 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 bg-green-500/20 p-2 rounded-lg">
              <RefreshCw className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-100 mb-1">
                Update Available
              </h3>
              <p className="text-xs text-green-200 mb-3">
                A new version of Kraken is available with bug fixes and improvements.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdate}
                  className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Update Now</span>
                </button>
                <button
                  onClick={() => setShowUpdatePrompt(false)}
                  className="text-green-400 hover:text-green-100 px-3 py-1.5 rounded text-xs transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="flex-shrink-0 text-green-400 hover:text-green-100 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Online Status Indicator */}
      <div className="fixed top-4 right-4 z-40">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs transition-all ${
          isOffline 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-green-500/20 text-green-400 border border-green-500/30'
        }`}>
          {isOffline ? (
            <WifiOff className="w-3 h-3" />
          ) : (
            <Wifi className="w-3 h-3" />
          )}
          <span>{isOffline ? 'Offline' : 'Online'}</span>
        </div>
      </div>
    </>
  );
}