import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Homepage from './components/Homepage';
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Auth/SignIn';
import Dashboard from './components/Dashboard/Dashboard';
import BrandManager from './components/Brand/BrandManager';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import PassView from './components/PassView';

const theme = createTheme({
  palette: {
    primary: { main: '#E63976', contrastText: '#FFFFFF' },
    secondary: { main: '#FFC857' },
    background: { default: '#FFF8F8', paper: '#FFE6EE' },
    text: { primary: '#2E2E2E', secondary: '#6B7280' },
    success: { main: '#2ECC71' },
    info: { main: '#1B1F3B' },
    action: { hover: '#C62E66' },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } } },
    MuiAppBar: { styleOverrides: { colorPrimary: { backgroundColor: '#1B1F3B' } } },
    MuiPaper: { styleOverrides: { root: { backgroundColor: '#FFE6EE' } } },
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
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/" />;
};

function AppContent() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleSignInSuccess = () => {
    setShowSignIn(false);
    navigate('/dashboard');
  };

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Homepage
                onSignUp={() => setShowSignUp(true)}
                onSignIn={() => setShowSignIn(true)}
              />
              <SignUp open={showSignUp} onClose={() => setShowSignUp(false)} onSuccess={() => { setShowSignUp(false); }} />
              <SignIn open={showSignIn} onClose={() => setShowSignIn(false)} onSuccess={handleSignInSuccess} />
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/brands/:brandId"
          element={
            <PrivateRoute>
              <BrandManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/pass/:passId"
          element={<PassView />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;