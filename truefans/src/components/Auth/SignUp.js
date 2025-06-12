import React, { useState } from 'react';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress } from '@mui/material';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const SignUp = ({ open, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // Store owner in Firestore
      await setDoc(doc(db, 'owners', userCredential.user.uid), {
        name: name,
        email: userCredential.user.email,
        createdAt: new Date().toISOString(),
      });
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Sign Up</DialogTitle>
      <DialogContent>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <TextField label="Name" fullWidth margin="dense" value={name} onChange={e => setName(e.target.value)} autoFocus />
        <TextField label="Email" fullWidth margin="dense" value={email} onChange={e => setEmail(e.target.value)} type="email" />
        <TextField label="Password" fullWidth margin="dense" value={password} onChange={e => setPassword(e.target.value)} type="password" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSignUp} variant="contained" disabled={loading || !email || !password || !name}>
          {loading ? <CircularProgress size={24} /> : 'Sign Up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignUp; 