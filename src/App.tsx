import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Sales } from './pages/Sales';
import { Expenses } from './pages/Expenses';
import { Items } from './pages/Items';
import { Suspense } from 'react';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Box, Typography } from '@mui/material';

// Protected Route wrapper component
function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Not Found page
function NotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 700, color: 'text.secondary' }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
    </Box>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner fullscreen />}>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/sales" replace /> : <Login />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/sales" replace />} />
            <Route path="sales" element={<Sales />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="items" element={<Items />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeContextProvider>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ThemeContextProvider>
    </ErrorBoundary>
  );
}

export default App;
