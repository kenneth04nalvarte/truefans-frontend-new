import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';

const BrandDashboard = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    fetchBrands();
    const user = auth.currentUser;
    if (user) setOwnerName(user.email || user.displayName || 'Owner');
  }, []);

  const fetchBrands = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(collection(db, 'brands'), where('ownerId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    setBrands(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleOpenDialog = (brand = null) => {
    setEditBrand(brand);
    setBrandName(brand ? brand.name : '');
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditBrand(null);
    setBrandName('');
  };
  const handleSaveBrand = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (editBrand) {
      await updateDoc(doc(db, 'brands', editBrand.id), { name: brandName });
    } else {
      await addDoc(collection(db, 'brands'), { name: brandName, ownerId: user.uid });
    }
    handleCloseDialog();
    fetchBrands();
  };
  const handleRemoveBrand = async (id) => {
    await deleteDoc(doc(db, 'brands', id));
    fetchBrands();
  };

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
          {brands.map((brand) => (
            <Grid container alignItems="center" spacing={2} key={brand.id} sx={{ mb: 1 }}>
              <Grid item xs={6}>
                <Typography>{brand.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Button variant="outlined" onClick={() => navigate(`/brands/${brand.id}`)}>
                  Manage Brand
                </Button>
                <Button size="small" sx={{ ml: 1 }} onClick={() => handleOpenDialog(brand)}>Edit</Button>
                <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => handleRemoveBrand(brand.id)}>Remove</Button>
              </Grid>
            </Grid>
          ))}
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => handleOpenDialog()}>Add New Brand</Button>
        </Box>
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Brand Name"
            fullWidth
            value={brandName}
            onChange={e => setBrandName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveBrand} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BrandDashboard; 