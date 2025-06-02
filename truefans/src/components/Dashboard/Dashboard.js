import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRestaurantData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRestaurantData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const restaurantsQuery = query(
        collection(db, 'restaurants'),
        where('ownerId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(restaurantsQuery);
      if (!querySnapshot.empty) {
        setRestaurant({
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        });
      }
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      setError('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const isTrialExpiring = () => {
    if (!restaurant || restaurant.subscriptionStatus !== 'trial') return false;
    const trialEnd = restaurant.trialEndDate.toDate();
    const daysUntilExpiry = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3;
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!restaurant) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Welcome to TrueFans!
          </Typography>
          <Typography variant="body1" paragraph>
            You haven't registered your restaurant yet. Let's get started!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate('/register-restaurant')}
          >
            Register Your Restaurant
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {isTrialExpiring() && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your trial period is ending soon. Upgrade to continue using all features.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {restaurant.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {restaurant.address}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              onClick={() => navigate('/register-restaurant')}
            >
              Edit Restaurant
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Digital Passes
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Create and manage digital passes for your customers. Track usage and benefits.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                color="primary"
                onClick={() => navigate('/digital-passes')}
              >
                Manage Passes
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                View insights about your restaurant's performance and customer engagement.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                color="primary"
                onClick={() => navigate('/analytics')}
              >
                View Analytics
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Feedback
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Read and respond to customer reviews and feedback.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                color="primary"
                onClick={() => navigate('/feedback')}
              >
                View Feedback
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage your account settings and preferences.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                color="primary"
                onClick={() => navigate('/settings')}
              >
                Open Settings
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Passes
            </Typography>
            <Typography component="p" variant="h4">
              {restaurant?.passesIssued || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Active Promotions
            </Typography>
            <Typography component="p" variant="h4">
              {restaurant?.activePromotions?.length || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Customer Engagement
            </Typography>
            <Typography component="p" variant="h4">
              {restaurant?.totalEngagements || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 