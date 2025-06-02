import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Paper, Box, Typography, Tabs, Tab, Button, Avatar, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const BrandManager = () => {
  const navigate = useNavigate();
  const { brandId } = useParams();
  const [tab, setTab] = useState(0);
  const [locations, setLocations] = useState([]);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const [editLocation, setEditLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationPhone, setLocationPhone] = useState('');
  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [passes, setPasses] = useState([]);
  const [openPassDialog, setOpenPassDialog] = useState(false);
  const [editPass, setEditPass] = useState(null);
  const [passName, setPassName] = useState('');
  const [passDescription, setPassDescription] = useState('');
  const [passBenefits, setPassBenefits] = useState('');
  const [passValidity, setPassValidity] = useState('30');
  const [passColor, setPassColor] = useState('#E63976');
  const [passPunches, setPassPunches] = useState(0);
  const [passImage, setPassImage] = useState(null);
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const brandName = 'Brand'; // Placeholder, can fetch from Firestore if needed

  useEffect(() => {
    fetchLocations();
    fetchPasses();
  }, [brandId]);

  const fetchLocations = async () => {
    if (!brandId) return;
    const q = query(collection(db, 'locations'), where('brandId', '==', brandId));
    const querySnapshot = await getDocs(q);
    setLocations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchPasses = async () => {
    if (!brandId) return;
    const q = query(collection(db, 'digitalPasses'), where('brandId', '==', brandId));
    const querySnapshot = await getDocs(q);
    setPasses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddLocation = () => {
    setEditLocation(null);
    setLocationName('');
    setLocationAddress('');
    setLocationPhone('');
    setLocationError('');
    setOpenLocationDialog(true);
  };
  const handleEditLocation = (loc) => {
    setEditLocation(loc);
    setLocationName(loc.name);
    setLocationAddress(loc.address || '');
    setLocationPhone(loc.phone || '');
    setOpenLocationDialog(true);
  };
  const handleRemoveLocation = async (id) => {
    await deleteDoc(doc(db, 'locations', id));
    fetchLocations();
  };
  const handleSaveLocation = async () => {
    setLocationLoading(true);
    setLocationError('');
    try {
      if (editLocation) {
        await updateDoc(doc(db, 'locations', editLocation.id), { name: locationName, address: locationAddress, phone: locationPhone });
      } else {
        await addDoc(collection(db, 'locations'), { name: locationName, address: locationAddress, phone: locationPhone, brandId });
      }
      setOpenLocationDialog(false);
      setEditLocation(null);
      setLocationName('');
      setLocationAddress('');
      setLocationPhone('');
      fetchLocations();
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setLocationLoading(false);
    }
  };
  const handleCloseLocationDialog = () => {
    setOpenLocationDialog(false);
    setEditLocation(null);
    setLocationName('');
    setLocationAddress('');
    setLocationPhone('');
    setLocationError('');
  };

  const handleCreatePass = () => {
    setEditPass(null);
    setPassName('');
    setPassDescription('');
    setPassBenefits('');
    setPassValidity('30');
    setPassColor('#E63976');
    setPassPunches(0);
    setPassImage(null);
    setPassError('');
    setOpenPassDialog(true);
  };
  const handleEditPass = (pass) => {
    setEditPass(pass);
    setPassName(pass.name);
    setPassDescription(pass.description);
    setPassBenefits(pass.benefits);
    setPassValidity(pass.validityPeriod || '30');
    setPassColor(pass.color || '#E63976');
    setPassPunches(pass.punches || 0);
    setPassImage(null);
    setPassError('');
    setOpenPassDialog(true);
  };
  const handleDeactivatePass = async (pass) => {
    await updateDoc(doc(db, 'digitalPasses', pass.id), { active: false });
    fetchPasses();
  };
  const handleViewPass = (pass) => {
    window.open(`/pass/${pass.id}`, '_blank');
  };
  const handleSavePass = async () => {
    setPassLoading(true);
    setPassError('');
    try {
      let imageUrl = '';
      if (passImage) {
        const storage = getStorage();
        const imageRef = ref(storage, `passes/${brandId}/${Date.now()}`);
        await uploadBytes(imageRef, passImage);
        imageUrl = await getDownloadURL(imageRef);
      }
      const passData = {
        name: passName,
        description: passDescription,
        benefits: passBenefits,
        validityPeriod: passValidity,
        color: passColor,
        punches: passPunches,
        image: imageUrl,
        brandId,
        createdAt: new Date().toISOString(),
        active: true,
      };
      if (editPass) {
        await updateDoc(doc(db, 'digitalPasses', editPass.id), passData);
      } else {
        await addDoc(collection(db, 'digitalPasses'), passData);
      }
      setOpenPassDialog(false);
      fetchPasses();
    } catch (err) {
      setPassError(err.message);
    } finally {
      setPassLoading(false);
    }
  };
  const handleClosePassDialog = () => {
    setOpenPassDialog(false);
    setEditPass(null);
    setPassName('');
    setPassDescription('');
    setPassBenefits('');
    setPassValidity('30');
    setPassColor('#E63976');
    setPassPunches(0);
    setPassImage(null);
    setPassError('');
  };

  return (
    <>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">{brandName}</Typography>
            <Box display="flex" alignItems="center">
              <Button onClick={() => navigate(-1)} sx={{ mr: 2 }}>Back</Button>
              <Avatar sx={{ bgcolor: 'primary.main' }}><AccountCircleIcon /></Avatar>
            </Box>
          </Box>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary" variant="fullWidth" sx={{ mb: 3 }}>
            <Tab label="Locations" />
            <Tab label="Digital Passes" />
            <Tab label="Settings" />
          </Tabs>
          {tab === 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Locations:</Typography>
              <Grid container spacing={2}>
                {locations.map(loc => (
                  <Grid item xs={12} key={loc.id}>
                    <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography>{loc.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{loc.address}</Typography>
                        <Typography variant="body2" color="text.secondary">{loc.phone}</Typography>
                      </Box>
                      <Box>
                        <Button size="small" onClick={() => handleEditLocation(loc)} sx={{ mr: 1 }}>Edit</Button>
                        <Button size="small" color="error" onClick={() => handleRemoveLocation(loc.id)}>Remove</Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Button variant="contained" sx={{ mt: 3 }} onClick={handleAddLocation}>Add New Location</Button>
            </Box>
          )}
          {tab === 1 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Digital Passes:</Typography>
              <Grid container spacing={2}>
                {passes.map(pass => (
                  <Grid item xs={12} key={pass.id}>
                    <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography>{pass.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{pass.description}</Typography>
                        <Typography variant="body2" color="text.secondary">{pass.benefits}</Typography>
                        <Typography variant="body2" color="text.secondary">Validity: {pass.validityPeriod} days</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          {[...Array(5)].map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 24,
                                height: 24,
                                border: '2px solid',
                                borderColor: pass.color || '#E63976',
                                background: i < (pass.punches || 0) ? (pass.color || '#E63976') : 'transparent',
                                borderRadius: 2,
                                mx: 0.5
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box>
                        <Button size="small" onClick={() => handleEditPass(pass)} sx={{ mr: 1 }}>Edit</Button>
                        <Button size="small" color="warning" onClick={() => handleDeactivatePass(pass)} sx={{ mr: 1 }}>Deactivate</Button>
                        <Button size="small" onClick={() => handleViewPass(pass)}>View</Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Button variant="contained" sx={{ mt: 3 }} onClick={handleCreatePass}>Create New Pass</Button>
              <Dialog open={openPassDialog} onClose={handleClosePassDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editPass ? 'Edit Pass' : 'Create New Pass'}</DialogTitle>
                <DialogContent>
                  {passError && (
                    <Typography color="error" sx={{ mb: 2 }}>{passError}</Typography>
                  )}
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Pass Name"
                    fullWidth
                    value={passName}
                    onChange={e => setPassName(e.target.value)}
                    required
                  />
                  <TextField
                    margin="dense"
                    label="Description"
                    fullWidth
                    value={passDescription}
                    onChange={e => setPassDescription(e.target.value)}
                  />
                  <TextField
                    margin="dense"
                    label="Benefits"
                    fullWidth
                    value={passBenefits}
                    onChange={e => setPassBenefits(e.target.value)}
                  />
                  <TextField
                    margin="dense"
                    label="Validity Period (days)"
                    type="number"
                    fullWidth
                    value={passValidity}
                    onChange={e => setPassValidity(e.target.value)}
                  />
                  <TextField
                    margin="dense"
                    label="Color"
                    type="color"
                    fullWidth
                    value={passColor}
                    onChange={e => setPassColor(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Typography sx={{ mr: 2 }}>Punch Card:</Typography>
                    {[...Array(5)].map((_, i) => (
                      <Box
                        key={i}
                        onClick={() => setPassPunches(i + 1)}
                        sx={{
                          width: 32,
                          height: 32,
                          border: '2px solid',
                          borderColor: passColor,
                          background: i < passPunches ? passColor : 'transparent',
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
                      onChange={e => setPassImage(e.target.files[0])}
                    />
                  </Button>
                  {passImage && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected: {passImage.name}
                    </Typography>
                  )}
                  {/* Live preview */}
                  <Box sx={{ mt: 3, p: 2, border: '1px dashed #E63976', borderRadius: 2, background: '#FFF8F8' }}>
                    <Typography variant="subtitle2">Live Preview:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box sx={{ width: 48, height: 48, bgcolor: passColor, borderRadius: 2, mr: 2 }} />
                      <Box>
                        <Typography>{passName || 'Pass Name'}</Typography>
                        <Typography variant="body2" color="text.secondary">{passDescription || 'Description'}</Typography>
                        <Typography variant="body2" color="text.secondary">{passBenefits || 'Benefits'}</Typography>
                        <Typography variant="body2" color="text.secondary">Validity: {passValidity || '30'} days</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          {[...Array(5)].map((_, i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 24,
                                height: 24,
                                border: '2px solid',
                                borderColor: passColor,
                                background: i < passPunches ? passColor : 'transparent',
                                borderRadius: 2,
                                mx: 0.5
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClosePassDialog}>Cancel</Button>
                  <Button onClick={handleSavePass} variant="contained" disabled={passLoading || !passName.trim()}>
                    {passLoading ? 'Saving...' : (editPass ? 'Save Changes' : 'Create Pass')}
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}
          {tab === 2 && (
            <Box>
              <Typography>Settings coming soon...</Typography>
            </Box>
          )}
        </Paper>
        <Dialog open={openLocationDialog} onClose={handleCloseLocationDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
          <DialogContent>
            {locationError && (
              <Typography color="error" sx={{ mb: 2 }}>{locationError}</Typography>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Location Name"
              fullWidth
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
              required
            />
            <TextField
              margin="dense"
              label="Address"
              fullWidth
              value={locationAddress}
              onChange={e => setLocationAddress(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              value={locationPhone}
              onChange={e => setLocationPhone(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLocationDialog}>Cancel</Button>
            <Button onClick={handleSaveLocation} variant="contained" disabled={locationLoading || !locationName.trim()}>
              {locationLoading ? 'Saving...' : 'Save'}
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

export default BrandManager; 