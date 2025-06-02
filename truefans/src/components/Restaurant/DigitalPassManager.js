import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DigitalPassManager = ({ brandId, onClose, open }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passes, setPasses] = useState([]);
  const [newPass, setNewPass] = useState({
    name: '',
    description: '',
    benefits: '',
    validityPeriod: '30', // days
    image: null,
    color: '#1976d2',
    punches: 0
  });
  const [dialogError, setDialogError] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);

  useEffect(() => {
    fetchPasses();
  }, [brandId]);

  const fetchPasses = async () => {
    try {
      if (!brandId) return;
      const passesQuery = query(
        collection(db, 'digitalPasses'),
        where('brandId', '==', brandId)
      );
      const querySnapshot = await getDocs(passesQuery);
      const passesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPasses(passesList);
    } catch (error) {
      setError('Failed to fetch digital passes');
    }
  };

  const handleCreatePass = async () => {
    setDialogLoading(true);
    setDialogError('');
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to create a digital pass');
      }
      let imageUrl = '';
      if (newPass.image) {
        const storage = getStorage();
        const imageRef = ref(storage, `passes/${user.uid}/${Date.now()}`);
        await uploadBytes(imageRef, newPass.image);
        imageUrl = await getDownloadURL(imageRef);
      }
      const passData = {
        ...newPass,
        image: imageUrl,
        restaurantId: user.restaurantId,
        brandId: brandId || user.brandId,
        createdAt: new Date().toISOString(),
        active: true,
        punches: newPass.punches,
        color: newPass.color
      };
      await addDoc(collection(db, 'digitalPasses'), passData);
      if (onClose) onClose();
      setNewPass({
        name: '',
        description: '',
        benefits: '',
        validityPeriod: '30',
        image: null,
        color: '#1976d2',
        punches: 0
      });
      fetchPasses();
    } catch (error) {
      setDialogError(error.message);
      console.log('Pass Firestore error:', error);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPass(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleTogglePass = async (passId, currentStatus) => {
    try {
      const passRef = doc(db, 'digitalPasses', passId);
      await updateDoc(passRef, {
        active: !currentStatus
      });
      fetchPasses();
    } catch (error) {
      setError('Failed to update pass status');
    }
  };

  const handlePunchBoxClick = (index) => {
    setNewPass(prev => ({ ...prev, punches: index + 1 }));
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Digital Passes
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {passes.map((pass) => (
            <Grid item xs={12} md={6} lg={4} key={pass.id}>
              <Card>
                <CardContent>
                  {pass.image && (
                    <Box sx={{ mb: 2, textAlign: 'center' }}>
                      <img
                        src={pass.image}
                        alt={pass.name}
                        style={{ maxWidth: '100%', maxHeight: '200px' }}
                      />
                    </Box>
                  )}
                  <Typography variant="h6" gutterBottom>
                    {pass.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {pass.description}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Benefits:</strong> {pass.benefits}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Validity:</strong> {pass.validityPeriod} days
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'center' }}>
                    {[...Array(5)].map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 24,
                          height: 24,
                          border: '2px solid',
                          borderColor: pass.color || '#1976d2',
                          background: i < (pass.punches || 0) ? (pass.color || '#1976d2') : 'transparent',
                          borderRadius: 2,
                          mx: 0.5
                        }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <QRCodeSVG
                      value={`https://gettruefans.netlify.app/register?brandId=${pass.brandId || brandId}&passId=${pass.id}`}
                      size={200}
                      level="H"
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Registration URL:<br />
                      <a href={`https://gettruefans.netlify.app/register?brandId=${pass.brandId || brandId}&passId=${pass.id}`} target="_blank" rel="noopener noreferrer">
                        https://gettruefans.netlify.app/register?brandId={pass.brandId || brandId}&passId={pass.id}
                      </a>
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 1, mr: 1 }}>Add to Google Wallet</Button>
                    <Button variant="outlined" sx={{ mt: 1 }}>Add to Apple Wallet</Button>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color={pass.active ? 'error' : 'success'}
                    onClick={() => handleTogglePass(pass.id, pass.active)}
                  >
                    {pass.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => window.open(`${window.location.origin}/pass/${pass.id}`, '_blank')}
                  >
                    View Pass
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog 
          open={open} 
          onClose={onClose} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>Create New Digital Pass</DialogTitle>
          <DialogContent>
            {dialogError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {dialogError}
              </Typography>
            )}
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Pass Name"
                value={newPass.name}
                onChange={(e) => setNewPass(prev => ({ ...prev, name: e.target.value }))}
                margin="normal"
                required
                autoFocus
              />
              <TextField
                fullWidth
                label="Description"
                value={newPass.description}
                onChange={(e) => setNewPass(prev => ({ ...prev, description: e.target.value }))}
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Benefits"
                value={newPass.benefits}
                onChange={(e) => setNewPass(prev => ({ ...prev, benefits: e.target.value }))}
                margin="normal"
                multiline
                rows={2}
                placeholder="e.g., 10% off all items, Free dessert with main course"
              />
              <TextField
                fullWidth
                label="Validity Period (days)"
                type="number"
                value={newPass.validityPeriod}
                onChange={(e) => setNewPass(prev => ({ ...prev, validityPeriod: e.target.value }))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Color"
                type="color"
                value={newPass.color}
                onChange={e => setNewPass(prev => ({ ...prev, color: e.target.value }))}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography sx={{ mr: 2 }}>Punch Card:</Typography>
                {[...Array(5)].map((_, i) => (
                  <Box
                    key={i}
                    onClick={() => handlePunchBoxClick(i)}
                    sx={{
                      width: 32,
                      height: 32,
                      border: '2px solid',
                      borderColor: newPass.color,
                      background: i < newPass.punches ? newPass.color : 'transparent',
                      borderRadius: 2,
                      cursor: 'pointer',
                      mx: 0.5
                    }}
                  />
                ))}
              </Box>
              <Button
                variant="contained"
                component="label"
                sx={{ mt: 2 }}
              >
                Upload Pass Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {newPass.image && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {newPass.image.name}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleCreatePass} 
              variant="contained" 
              disabled={dialogLoading || !newPass.name.trim()}
            >
              {dialogLoading ? 'Saving...' : 'Create Pass'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Box sx={{ width: '100%', textAlign: 'center', py: 2, color: 'text.secondary', fontSize: 14 }}>
        Varte Enterprises Inc
      </Box>
    </>
  );
};

export default DigitalPassManager; 