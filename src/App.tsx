import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from 'react-oidc-context';
import theme from './theme';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Containers from './pages/Containers';
import Security from './pages/Security';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { DataProvider } from './contexts/DataContext';

function App() {
  const oidcConfig = {
    authority: import.meta.env.VITE_OIDC_AUTHORITY,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
    scope: 'openid profile email',
    monitorSession: false, // Disable session monitoring to improve performance
    onSigninCallback: () => {
      // Remove the code and state from the URL after successful login
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  console.log('OIDC Config:', {
    authority: oidcConfig.authority,
    client_id: oidcConfig.client_id,
    redirect_uri: oidcConfig.redirect_uri
  });

  if (!oidcConfig.authority || !oidcConfig.client_id) {
    return (
      <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h1>Configuration Error</h1>
        <p>OIDC configuration is missing. Please check your <code>.env</code> file.</p>
        <p>Required variables:</p>
        <ul>
          <li><code>VITE_OIDC_AUTHORITY</code></li>
          <li><code>VITE_OIDC_CLIENT_ID</code></li>
          <li><code>VITE_OIDC_REDIRECT_URI</code></li>
        </ul>
        <p>Current values:</p>
        <pre>{JSON.stringify(oidcConfig, null, 2)}</pre>
        <p><strong>Note:</strong> You must restart the dev server after editing <code>.env</code>.</p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider {...oidcConfig}>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<DashboardHome />} />
                      <Route path="/containers" element={<Containers />} />
                      <Route path="/security" element={<Security />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
