import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  const [error, setError] = useState('');
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrands();
    // eslint-disable-next-line
  }, [user]);

  const fetchBrands = async () => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, 'brands'), where('ownerId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    setBrands(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleAddBrand = () => {
    setEditBrand(null);
    setBrandName('');
    setError('');
    setOpenDialog(true);
  };
  const handleEditBrand = (brand) => {
    setEditBrand(brand);
    setBrandName(brand.name);
    setError('');
    setOpenDialog(true);
  };
  const handleRemoveBrand = async (brand) => {
    await deleteDoc(doc(db, 'brands', brand.id));
    fetchBrands();
  };
  const handleSaveBrand = async () => {
    setDialogLoading(true);
    setError('');
    try {
      console.log('Current user:', user);
      if (!user) {
        setError('You must be logged in to create a brand.');
        setDialogLoading(false);
        return;
      }
      if (editBrand) {
        await updateDoc(doc(db, 'brands', editBrand.id), { name: brandName });
      } else {
        await addDoc(collection(db, 'brands'), {
          name: brandName,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
        });
      }
      setOpenDialog(false);
      fetchBrands();
    } catch (err) {
      setError(err.message);
    } finally {
      setDialogLoading(false);
    }
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditBrand(null);
    setBrandName('');
    setError('');
  };
  const handleManageBrand = (brand) => {
    navigate(`/brands/${brand.id}`);
  };

  if (loading) return <Box sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ mt: 6, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
          Welcome, {user?.displayName || 'Owner'}!
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
          Your Brands:
        </Typography>
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {brands.map((brand) => (
            <Box component="li" key={brand.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, borderBottom: '1px solid #eee', pb: 1 }}>
              <Typography sx={{ fontWeight: 500 }}>{brand.name}</Typography>
              <Box>
                <Button size="small" variant="outlined" sx={{ ml: 1 }} onClick={() => handleManageBrand(brand)}>Manage Brand</Button>
                <Button size="small" sx={{ ml: 1 }} onClick={() => handleEditBrand(brand)}>Edit</Button>
                <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => handleRemoveBrand(brand)}>Remove</Button>
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button variant="contained" onClick={handleAddBrand}>Add New Brand</Button>
        </Box>
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
        <DialogContent>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <TextField
            label="Brand Name"
            fullWidth
            margin="dense"
            value={brandName}
            onChange={e => setBrandName(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveBrand} variant="contained" disabled={dialogLoading || !brandName.trim()}>
            {dialogLoading ? <CircularProgress size={24} /> : (editBrand ? 'Save Changes' : 'Add Brand')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 