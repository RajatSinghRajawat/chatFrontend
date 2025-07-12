import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Avatar, Typography, Button, IconButton, Stack, CircularProgress, Paper, Grid } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';

const loggedInUser = JSON.parse(localStorage.getItem('userdatachat'));

const ProfilePage = ({ isSelf }) => {
  const loggedInUser = JSON.parse(localStorage.getItem('userdatachat'));
  const userId = loggedInUser?._id;
  console.log(userId, "userId");
  const navigate = useNavigate();
  const [user, setUser] = useState(isSelf ? loggedInUser : null);
  const [loading, setLoading] = useState(!isSelf);
  const [error, setError] = useState('');

  useEffect(() => {
    if ( userId) {
      setLoading(true);
      fetch(`http://localhost:5000/api/auth/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load user');
          setLoading(false);
        });
    }
  }, [isSelf, userId]);

  if (loading) return <Stack alignItems="center" justifyContent="center" sx={{ height: '100vh' }}><CircularProgress /></Stack>;
  if (!user) return <Typography sx={{ color: '#fff', p: 4 }}>User not found</Typography>;
  if (error) return <Typography sx={{ color: 'error.main', p: 4 }}>{error}</Typography>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', color: '#23243a', fontFamily: 'Inter, Roboto, system-ui, sans-serif', p: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid #e3e8ee', bgcolor: '#2196f3' }}>
        <IconButton onClick={() => navigate('/chat')} sx={{ color: '#fff', mr: 2 }}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>Profile</Typography>
      </Box>
      <Stack alignItems="center" spacing={2} sx={{ mt: 6 }}>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4, minWidth: 340, maxWidth: 420, width: '100%', bgcolor: '#fff', boxShadow: '0 4px 24px 0 #4F8CFF20' }}>
          <Stack alignItems="center" spacing={1}>
            <Avatar src={user.avatar} sx={{ width: 120, height: 120, fontSize: 48, mb: 1 }}>
              {user.name ? user.name[0] : user.username ? user.username[0] : '?'}
            </Avatar>
            <Typography variant="h5" fontWeight={700}>{user.name}</Typography>
            {user.bio && <Typography variant="body1" color="#4F8CFF" sx={{ mb: 1, fontStyle: 'italic', textAlign: 'center' }}>{user.bio}</Typography>}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CircleIcon sx={{ color: user.online ? '#4F8CFF' : '#aaa', fontSize: 16 }} />
              <Typography variant="body2" color={user.online ? '#4F8CFF' : '#aaa'} fontWeight={600}>
                {user.online ? 'Online' : 'Offline'}
              </Typography>
            </Stack>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {user.username && <Grid item xs={12}><Typography variant="body2"><b>Username:</b> {user.username}</Typography></Grid>}
              {user.personalPhone && <Grid item xs={12}><Typography variant="body2"><b>Personal Phone:</b> {user.personalPhone}</Typography></Grid>}
              {user.workPhone && <Grid item xs={12}><Typography variant="body2"><b>Work Phone:</b> {user.workPhone}</Typography></Grid>}
              {user.city && <Grid item xs={12}><Typography variant="body2"><b>City:</b> {user.city}</Typography></Grid>}
              {user.country && <Grid item xs={12}><Typography variant="body2"><b>Country:</b> {user.country}</Typography></Grid>}
              {user.organization && <Grid item xs={12}><Typography variant="body2"><b>Organization:</b> {user.organization}</Typography></Grid>}
            </Grid>
            <Button
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ mt: 2, bgcolor: '#4F8CFF', color: '#fff', fontWeight: 700, px: 4, borderRadius: 2, boxShadow: '0 4px 24px 0 #4F8CFF40', textTransform: 'none', fontSize: 16 }}
                onClick={() => navigate('/profile/edit')}
              >
                Edit Profile
              </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
};

export default ProfilePage; 