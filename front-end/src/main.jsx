import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppContextProvider } from './context/AppContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import ErrorBoundary from './Components/ErrorBoundary';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const root = createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <ErrorBoundary>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl='/'
        appearance={{
          baseTheme: undefined,
          variables: {
            colorPrimary: '#3B82F6',
            colorText: '#1F2937',
            colorBackground: '#FFFFFF',
            colorInputBackground: '#F3F4F6',
            colorInputText: '#1F2937',
            colorTextSecondary: '#6B7280',
            colorTextOnPrimaryBackground: '#FFFFFF',
          },
        }}
      >
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </ClerkProvider>
    </ErrorBoundary>
  </BrowserRouter> 
)
