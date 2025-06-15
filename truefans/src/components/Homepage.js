import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';

const Homepage = ({ onSignUp, onSignIn }) => (
  <>
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #eee' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: '#E63976', fontWeight: 700 }}>
          TrueFans
        </Typography>
        <Button color="primary" variant="outlined" sx={{ mr: 2 }} onClick={onSignUp}>Sign Up</Button>
        <Button color="primary" variant="contained" onClick={onSignIn}>Sign In</Button>
      </Toolbar>
    </AppBar>
    <Box sx={{ bgcolor: '#FFF8F8', py: 10 }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography variant="h2" sx={{ color: '#E63976', fontWeight: 800, mb: 2 }}>
          Grow Your Restaurant Brand
        </Typography>
        <Typography variant="h5" sx={{ color: '#1A2341', mb: 4 }}>
          Manage brands, locations, and digital passes with ease.
        </Typography>
        <Button color="primary" variant="contained" size="large" sx={{ mr: 2 }} onClick={onSignUp}>
          Get Started
        </Button>
        <Button color="primary" variant="outlined" size="large" onClick={onSignIn}>
          Sign In
        </Button>
      </Container>
    </Box>
  </>
);

export default Homepage; 