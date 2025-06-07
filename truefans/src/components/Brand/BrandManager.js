import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Avatar, Tabs, Tab, Box, Paper, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { QRCodeSVG } from 'qrcode.react';
import { auth } from '../../config/firebase';

const BrandManager = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editLocation, setEditLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationPhone, setLocationPhone] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  const [error, setError] = useState('');
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
  const [qrDialogOpen, setQRDialogOpen] = useState(false);
  const [qrPass, setQRPass] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [brandLoading, setBrandLoading] = useState(true);

  useEffect(() => {
    const fetchBrand = async () => {
      if (!brandId) return;
      setBrandLoading(true);
      const brandDoc = await getDocs(query(collection(db, 'brands'), where('__name__', '==', brandId)));
      if (!brandDoc.empty) {
        setBrandName(brandDoc.docs[0].data().name);
      } else {
        setBrandName('Brand');
      }
      setBrandLoading(false);
    };
    fetchBrand();
    fetchLocations();
    fetchPasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandId]);

  const fetchLocations = async () => {
    if (!brandId) return;
    setLoading(true);
    const q = query(collection(db, 'brands', brandId, 'locations'));
    const querySnapshot = await getDocs(q);
    setLocations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const fetchPasses = async () => {
    if (!brandId) return;
    const q = query(collection(db, 'brands', brandId, 'passes'));
    const querySnapshot = await getDocs(q);
    setPasses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleAddLocation = () => {
    setEditLocation(null);
    setLocationName('');
    setLocationAddress('');
    setLocationPhone('');
    setError('');
    setOpenDialog(true);
  };
  const handleEditLocation = (loc) => {
    setEditLocation(loc);
    setLocationName(loc.name);
    setLocationAddress(loc.address || '');
    setLocationPhone(loc.phone || '');
    setOpenDialog(true);
  };
  const handleRemoveLocation = async (id) => {
    await deleteDoc(doc(db, 'brands', brandId, 'locations', id));
    fetchLocations();
  };
  const handleSaveLocation = async () => {
    setDialogLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to create a location.');
        setDialogLoading(false);
        return;
      }
      if (editLocation) {
        await updateDoc(doc(db, 'brands', brandId, 'locations', editLocation.id), { name: locationName, address: locationAddress, phone: locationPhone });
      } else {
        await addDoc(collection(db, 'brands', brandId, 'locations'), { name: locationName, address: locationAddress, phone: locationPhone, ownerId: user.uid, createdAt: serverTimestamp() });
      }
      setOpenDialog(false);
      setEditLocation(null);
      setLocationName('');
      setLocationAddress('');
      setLocationPhone('');
      fetchLocations();
    } catch (err) {
      setError(err.message);
    } finally {
      setDialogLoading(false);
    }
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditLocation(null);
    setLocationName('');
    setLocationAddress('');
    setLocationPhone('');
    setError('');
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
    await updateDoc(doc(db, 'brands', brandId, 'passes', pass.id), { active: false });
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
        createdAt: new Date().toISOString(),
        active: true,
        brandId,
      };
      if (editPass) {
        await updateDoc(doc(db, 'brands', brandId, 'passes', editPass.id), passData);
      } else {
        await addDoc(collection(db, 'brands', brandId, 'passes'), passData);
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

  const handleShowQR = (pass) => {
    setQRPass(pass);
    setQRDialogOpen(true);
  };
  const handleCloseQR = () => {
    setQRDialogOpen(false);
    setQRPass(null);
  };

  return (
    <Box sx={{ mt: 4, maxWidth: 700, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        {/* Top Bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {brandLoading ? <CircularProgress size={20} sx={{ verticalAlign: 'middle' }} /> : brandName}
          </Typography>
          <Box display="flex" alignItems="center">
            <Button onClick={() => navigate(-1)} sx={{ mr: 2 }}>Back</Button>
            <Avatar sx={{ bgcolor: 'primary.main' }}><AccountCircleIcon /></Avatar>
          </Box>
        </Box>
        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary" variant="fullWidth" sx={{ mb: 3 }}>
          <Tab label="Locations" />
          <Tab label="Digital Passes" />
          <Tab label="Settings" />
        </Tabs>
        {/* Locations Tab */}
        {tab === 0 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Locations:</Typography>
            {loading ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>
            ) : (
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {locations.map(loc => (
                  <Box component="li" key={loc.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, borderBottom: '1px solid #eee', pb: 1 }}>
                    <Typography>{loc.name}</Typography>
                    <Box>
                      <Button size="small" sx={{ ml: 1 }} onClick={() => handleEditLocation(loc)}>Edit</Button>
                      <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => handleRemoveLocation(loc.id)}>Remove</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="contained" onClick={handleAddLocation}>Add New Location</Button>
            </Box>
            {/* Location Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
              <DialogTitle>{editLocation ? 'Edit Location' : 'Add New Location'}</DialogTitle>
              <DialogContent>
                {error && (
                  <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
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
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleSaveLocation} variant="contained" disabled={dialogLoading || !locationName.trim()}>
                  {dialogLoading ? 'Saving...' : 'Save'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
        {/* Digital Passes Tab */}
        {tab === 1 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Digital Passes:</Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {passes.map(pass => (
                <Box component="li" key={pass.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, borderBottom: '1px solid #eee', pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', background: pass.color, borderRadius: 2, p: 2, minWidth: 220 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, mr: 2, overflow: 'hidden', bgcolor: '#fff' }}>
                      {pass.image && (
                        <img src={pass.image} alt="Pass Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#fff', fontWeight: 600 }}>{pass.name}</Typography>
                      <Typography variant="body2" sx={{ color: '#fff' }}>{pass.description}</Typography>
                      <Typography variant="body2" sx={{ color: '#fff' }}>{pass.benefits}</Typography>
                      <Typography variant="body2" sx={{ color: '#fff' }}>Validity: {pass.validityPeriod} days</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        {[...Array(5)].map((_, i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 18,
                              height: 18,
                              border: '2px solid',
                              borderColor: '#fff',
                              background: i < (pass.punches || 0) ? '#fff' : 'transparent',
                              borderRadius: 2,
                              mx: 0.5
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    <Button size="small" sx={{ ml: 1 }} onClick={() => handleEditPass(pass)}>Edit</Button>
                    <Button size="small" color="warning" sx={{ ml: 1 }} onClick={() => handleDeactivatePass(pass)}>Deactivate</Button>
                    <Button size="small" sx={{ ml: 1 }} onClick={() => handleViewPass(pass)}>View</Button>
                    <Button size="small" sx={{ ml: 1 }} onClick={() => handleShowQR(pass)}>QR</Button>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="contained" onClick={handleCreatePass}>Create New Pass</Button>
            </Box>
            {/* Pass Dialog and QR Dialog remain unchanged */}
          </Box>
        )}
        {/* Settings Tab */}
        {tab === 2 && (
          <Box>
            <Typography variant="subtitle1">Settings tab coming soon...</Typography>
          </Box>
        )}
      </Paper>
      {/* QR Dialog and Pass Dialog remain unchanged */}
      <Dialog open={qrDialogOpen} onClose={handleCloseQR} maxWidth="xs" fullWidth>
        <DialogTitle>Pass QR Code & URL</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {qrPass && (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>Scan or share this QR code with diners:</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <QRCodeSVG value={`${window.location.origin}/pass/${qrPass.id}`} size={180} />
              </Box>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {`${window.location.origin}/pass/${qrPass.id}`}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQR}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openPassDialog} onClose={handleClosePassDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editPass ? 'Edit Pass' : 'Create New Pass'}</DialogTitle>
        <DialogContent>
          {passError && (
            <Typography color="error" sx={{ mb: 2 }}>{passError}</Typography>
          )}
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} md={7}>
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
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ mt: { xs: 3, md: 0 }, p: 2, border: '1px dashed #E63976', borderRadius: 2, background: '#FFF8F8', minHeight: 220 }}>
                <Typography variant="subtitle2">Live Preview:</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mt: 1,
                    background: passColor,
                    borderRadius: 2,
                    p: 2,
                    color: '#fff',
                  }}
                >
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, mr: 2, overflow: 'hidden', bgcolor: '#fff' }}>
                    {passImage && (
                      <img src={URL.createObjectURL(passImage)} alt="Pass Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>{passName || 'Pass Name'}</Typography>
                    <Typography variant="body2" sx={{ color: '#fff' }}>{passDescription || 'Description'}</Typography>
                    <Typography variant="body2" sx={{ color: '#fff' }}>{passBenefits || 'Benefits'}</Typography>
                    <Typography variant="body2" sx={{ color: '#fff' }}>Validity: {passValidity || '30'} days</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {[...Array(5)].map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 24,
                            height: 24,
                            border: '2px solid',
                            borderColor: '#fff',
                            background: i < passPunches ? '#fff' : 'transparent',
                            borderRadius: 2,
                            mx: 0.5
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePassDialog}>Cancel</Button>
          <Button onClick={handleSavePass} variant="contained" disabled={passLoading || !passName.trim()}>
            {passLoading ? 'Saving...' : (editPass ? 'Save Changes' : 'Create Pass')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrandManager; 