import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, IconButton, InputAdornment, Divider, Snackbar, Alert, Stack, Link, Grid, Paper } from '@mui/material';
import { FaGoogle, FaFacebookF, FaApple } from "react-icons/fa";
import { Visibility, VisibilityOff, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const resData = await response.json();
      if (!response.ok) {
        setSnackbar({ open: true, message: resData.msg || 'Registration failed', severity: 'error' });
        setError('api', { message: resData.msg || 'Registration failed' });
      } else {
        setSnackbar({ open: true, message: resData.msg || 'Registration successful! You can now log in.', severity: 'success' });
        reset();
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Registration failed', severity: 'error' });
      setError('api', { message: 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      fontFamily: 'Poppins, sans-serif',
      background: 'linear-gradient(90deg, #191B2A 0%, #23243a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <Grid container sx={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' }, columnGap: { xs: 0, md: '3rem' } }}>
        {/* Left Side */}
        <Grid item xs={12} md={4} sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#fff',
          minHeight: { xs: 'auto', md: '100vh' },
          py: { xs: 4, md: 0 },
        }}>
          <Box sx={{ width: '100%', maxWidth: 400, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 2, lineHeight: 1.1, fontFamily: 'Poppins, sans-serif', fontSize: 40 }}>
              Create your<br />Recharge Direct account
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.7)', fontSize: 16, fontFamily: 'Poppins, sans-serif' }}>
              Already have an account?<br />
              <Link href="/login" sx={{ color: '#4F8CFF', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>Login here!</Link>
            </Typography>
          </Box>
        </Grid>
        {/* Center Illustration */}
        <Grid item xs={12} md={4} sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: 'auto', md: '100vh' },
          py: { xs: 2, md: 0 },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', minHeight: 330 }}>
            <Box component="img" src="/src/components/Authentication/Picture.png" alt="3D Illustration" sx={{ width: { xs: 260, md: 400 }, height: { xs: 215, md: 330 }, objectFit: 'contain', background: 'none', borderRadius: 0, boxShadow: 0 }} />
          </Box>
        </Grid>
        {/* Right Side */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: { xs: 'auto', md: '100vh' }, py: { xs: 4, md: 0 } }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring' }}
            style={{ width: '100%', maxWidth: 380 }}
          >
            <Paper elevation={0} sx={{ borderRadius: 4, p: 0, bgcolor: 'transparent', boxShadow: 'none' }}>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} autoComplete="off" sx={{ p: 0, m: 0 }}>
                <Stack spacing={2}>
                  <TextField
                    label="Name"
                    fullWidth
                    margin="none"
                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                      sx: {
                        bgcolor: '#23243a',
                        borderRadius: 2,
                        color: '#fff',
                        fontSize: 16,
                        boxShadow: '0 2px 8px 0 #00000010',
                        height: 48,
                      },
                    }}
                    InputLabelProps={{ style: { color: '#aaa', fontFamily: 'Poppins, sans-serif' } }}
                  />
                  <TextField
                    label="Enter Email"
                    fullWidth
                    margin="none"
                    {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    variant="outlined"
                    InputProps={{
                      sx: {
                        bgcolor: '#23243a',
                        borderRadius: 2,
                        color: '#fff',
                        fontSize: 16,
                        boxShadow: '0 2px 8px 0 #00000010',
                        height: 48,
                      },
                    }}
                    InputLabelProps={{ style: { color: '#aaa', fontFamily: 'Poppins, sans-serif' } }}
                  />
                  <Box>
                    <TextField
                      label="Password"
                      fullWidth
                      margin="none"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      variant="outlined"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword} edge="end" aria-label="toggle password visibility" tabIndex={-1}>
                              {showPassword ? <VisibilityOff sx={{ color: '#aaa' }} /> : <Visibility sx={{ color: '#aaa' }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          bgcolor: '#23243a',
                          borderRadius: 2,
                          color: '#fff',
                          fontSize: 16,
                          boxShadow: '0 2px 8px 0 #00000010',
                          height: 48,
                        },
                      }}
                      InputLabelProps={{ style: { color: '#aaa', fontFamily: 'Poppins, sans-serif' } }}
                    />
                  </Box>
                  {errors.api && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.api.message}
                    </Alert>
                  )}
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      sx={{
                        mt: 1,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: 18,
                        bgcolor: 'linear-gradient(90deg, #4F8CFF 0%, #256DFF 100%)',
                        color: '#fff',
                        boxShadow: '0 4px 24px 0 #4F8CFF40',
                        py: 1.5,
                        letterSpacing: 1,
                        textTransform: 'none',
                        fontFamily: 'Poppins, sans-serif',
                        transition: 'box-shadow 0.2s',
                        '&:hover': {
                          boxShadow: '0 6px 32px 0 #4F8CFF80',
                          bgcolor: 'linear-gradient(90deg, #4F8CFF 0%, #256DFF 100%)',
                        },
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                  </motion.div>
                  <Divider sx={{ my: 2, color: '#333', opacity: 0.4, fontFamily: 'Poppins, sans-serif' }}>Or continue with</Divider>
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <IconButton size="large" sx={{ bgcolor: '#fff', color: '#EA4335', borderRadius: 2, boxShadow: 1, width: 56, height: 48 }}>
                        <FaGoogle />
                      </IconButton>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <IconButton size="large" sx={{ bgcolor: '#fff', color: '#000', borderRadius: 2, boxShadow: 1, width: 56, height: 48 }}>
                        <FaApple />
                      </IconButton>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <IconButton size="large" sx={{ bgcolor: '#fff', color: '#1877F3', borderRadius: 2, boxShadow: 1, width: 56, height: 48 }}>
                        <FaFacebookF />
                      </IconButton>
                    </motion.div>
                  </Stack>
                </Stack>
              </Box>
            </Paper>
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
              <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                {snackbar.message}
              </Alert>
            </Snackbar>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
