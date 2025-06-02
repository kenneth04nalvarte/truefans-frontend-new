import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Login from './components/Auth/Login';
import BrandDashboard from './components/Brand/BrandDashboard';
import Navbar from './components/Navigation/Navbar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import BrandManager from './components/BrandManager';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E63976', // Bold Rose Pink
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFC857', // Warm Gold / Yellow
    },
    background: {
      default: '#FFF8F8', // Light Blush White
      paper: '#FFE6EE', // Pale Rose Tint for cards
    },
    text: {
      primary: '#2E2E2E', // Charcoal / Soft Black
      secondary: '#6B7280', // Cool Gray
    },
    success: {
      main: '#2ECC71', // Fresh Mint Green
    },
    info: {
      main: '#1B1F3B', // Deep Navy (for NavBar)
    },
    action: {
      hover: '#C62E66', // Slightly deeper pink for hover
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#E63976',
          color: '#FFF',
          '&:hover': {
            backgroundColor: '#C62E66',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#1B1F3B',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFE6EE',
        },
      },
    },
  },
});

const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <>
                  <Navbar />
                  <BrandDashboard />
                </>
              </PrivateRoute>
            }
          />
          <Route path="/brands/:brandId" element={<BrandManager />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 