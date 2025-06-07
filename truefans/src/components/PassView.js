import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, TextField, Button, CircularProgress, MenuItem } from '@mui/material';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import axios from 'axios';

const howOptions = [
  'Social Media',
  'Friend/Family',
  'Walk-in',
  'Other',
];

const PassView = () => {
  const { passId } = useParams();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', birthday: '', how: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [applePassLoading, setApplePassLoading] = useState(false);

  // Use the environment variable for the backend URL
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchPass();
    // eslint-disable-next-line
  }, [passId]);

  const fetchPass = async () => {
    setLoading(true);
    const docRef = doc(db, 'digitalPasses', passId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) setPass(docSnap.data());
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setFormLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'diners'), {
        ...form,
        passId,
        registeredAt: serverTimestamp(),
      });
      setRegistered(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAppleWallet = async () => {
    setApplePassLoading(true);
    try {
      // Debug: log the pass object
      console.log('Pass object:', pass);
      if (!pass || !pass.brandId || !pass.locationId) {
        alert('This pass is missing brand or location information. Please contact support.');
        setApplePassLoading(false);
        return;
      }
      // Call your backend to generate the pass and get the download URL
      const token = localStorage.getItem('backendToken');
      const response = await axios.post(
        `${backendUrl}/digitalPasses/generate`,
        {
          name: form.name || 'Guest',
          phone: form.phone || '',
          birthday: form.birthday || '',
          brandId: pass.brandId,
          locationId: pass.locationId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.data && response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      } else {
        alert('Failed to generate Apple Wallet pass.');
      }
    } catch (err) {
      alert('Failed to generate Apple Wallet pass.');
    } finally {
      setApplePassLoading(false);
    }
  };

  if (loading) return <Box sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!pass) return <Box sx={{ mt: 8, textAlign: 'center' }}><Typography>Pass not found.</Typography></Box>;

  return (
    <Box sx={{ mt: 6, maxWidth: 420, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ color: '#E63976', fontWeight: 700, mb: 2 }}>{pass.name}</Typography>
        {!registered ? (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Register to claim this pass:</Typography>
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            <TextField label="Name" name="name" fullWidth margin="dense" value={form.name} onChange={handleChange} autoFocus />
            <TextField label="Phone Number" name="phone" fullWidth margin="dense" value={form.phone} onChange={handleChange} />
            <TextField label="Birthday" name="birthday" type="date" fullWidth margin="dense" value={form.birthday} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField select label="How did you hear about us?" name="how" fullWidth margin="dense" value={form.how} onChange={handleChange}>
              {howOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </TextField>
            <Button variant="contained" sx={{ mt: 2 }} fullWidth onClick={handleRegister} disabled={formLoading || !form.name || !form.phone || !form.birthday || !form.how}>
              {formLoading ? <CircularProgress size={24} /> : 'Register & Continue'}
            </Button>
          </>
        ) : (
          <>
            <Box sx={{ mb: 3, p: 2, border: '1px dashed #E63976', borderRadius: 2, background: '#FFF8F8' }}>
              <Typography variant="subtitle2">Your Digital Pass</Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1,
                  background: pass.color || '#E63976',
                  borderRadius: 2,
                  p: 2,
                  color: '#fff',
                }}
              >
                <Box sx={{ width: 48, height: 48, borderRadius: 2, mr: 2, overflow: 'hidden', bgcolor: '#fff' }}>
                  {pass.image && (
                    <img src={pass.image} alt="Pass Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </Box>
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 600 }}>{pass.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#fff' }}>{pass.description}</Typography>
                  <Typography variant="body2" sx={{ color: '#fff' }}>{pass.benefits}</Typography>
                  <Typography variant="body2" sx={{ color: '#fff' }}>Validity: {pass.validityPeriod || '30'} days</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {[...Array(5)].map((_, i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 24,
                          height: 24,
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
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Pass registered! Add to your phone:</Typography>
            <Button variant="contained" color="success" sx={{ mb: 2 }} fullWidth disabled>
              Add to Google Wallet
            </Button>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleAppleWallet}
              disabled={applePassLoading}
            >
              {applePassLoading ? 'Generating...' : 'Add to Apple Wallet'}
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PassView;
