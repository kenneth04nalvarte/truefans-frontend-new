import React from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { getAuth } from 'firebase/auth';

const Dashboard = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" color="primary" gutterBottom>
              Welcome, {user?.email}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                This is your dashboard. Here you can manage your account and view your activity.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 