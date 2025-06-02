import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';

const mockBrands = [
  { id: '1', name: 'Taco Bros' },
  { id: '2', name: 'Burger Queens' },
];

const BrandDashboard = () => {
  const navigate = useNavigate();
  const ownerName = 'Owner Name'; // Replace with real user data

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Welcome, {ownerName}!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Your Brands:
        </Typography>
        <Box>
          {mockBrands.map((brand) => (
            <Grid container alignItems="center" spacing={2} key={brand.id} sx={{ mb: 1 }}>
              <Grid item xs={6}>
                <Typography>{brand.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Button variant="outlined" onClick={() => navigate(`/brands/${brand.id}`)}>
                  Manage Brand
                </Button>
              </Grid>
            </Grid>
          ))}
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => alert('Add New Brand')}>Add New Brand</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BrandDashboard; 