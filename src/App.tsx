import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Status from './pages/Status';

import Containers from './pages/Containers';
import Security from './pages/Security';
import Settings from './pages/Settings';
import { DataProvider } from './contexts/DataContext';

function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <DataProvider>
        <BrowserRouter>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/status" element={<Status />} />
              <Route path="/containers" element={<Containers />} />
              <Route path="/security" element={<Security />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes >
          </DashboardLayout >
        </BrowserRouter >
      </DataProvider >
    </ThemeProvider >
  );
}

export default App;
