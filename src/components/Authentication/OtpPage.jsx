import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Box, Card, CardContent, Typography, TextField, Button, Snackbar, Alert, Avatar, Stack } from '@mui/material';
import { motion } from 'framer-motion';

export default function OtpPage() {
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' });

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', data);
      setSuccess(res.data.msg || 'OTP verified! You can now login.');
      setSnackbar({ open: true, message: res.data.msg || 'OTP verified! You can now login.', severity: 'success' });
      reset();
    } catch (err) {
      setError('api', { message: err.response?.data?.msg || 'OTP verification failed' });
      setSnackbar({ open: true, message: err.response?.data?.msg || 'OTP verification failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <Card elevation={8} sx={{ borderRadius: 4, overflow: 'visible', position: 'relative' }}>
          <CardContent>
            <Stack alignItems="center" spacing={2} mb={2}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: 'info.main', boxShadow: 3 }}>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  🔑
                </motion.div>
              </Avatar>
              <Typography variant="h5" fontWeight={700} color="info.main" textAlign="center">
                Verify OTP
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Enter the OTP sent to your email to verify your account
              </Typography>
            </Stack>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} autoComplete="off" sx={{ mt: 2 }}>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                error={!!errors.email}
                helperText={errors.email?.message}
                variant="outlined"
                InputProps={{ startAdornment: <span style={{ marginRight: 8 }}>📧</span> }}
              />
              <TextField
                label="OTP"
                fullWidth
                margin="normal"
                {...register('otp', { required: 'OTP is required', minLength: { value: 6, message: 'OTP must be 6 digits' }, maxLength: { value: 6, message: 'OTP must be 6 digits' } })}
                error={!!errors.otp}
                helperText={errors.otp?.message}
                variant="outlined"
                InputProps={{ startAdornment: <span style={{ marginRight: 8 }}>🔢</span> }}
              />
              {errors.api && (
                <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
                  {errors.api.message}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mt: 1, mb: 1 }}>
                  {success}
                </Alert>
              )}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="info"
                  fullWidth
                  size="large"
                  sx={{ mt: 2, borderRadius: 2, fontWeight: 600, boxShadow: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </motion.div>
            </Box>
          </CardContent>
        </Card>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Box>
  );
} 