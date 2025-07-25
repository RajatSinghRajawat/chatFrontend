import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, List, ListItem, ListItemIcon, ListItemText, Avatar, Typography, TextField, Button, Snackbar, IconButton, Grid, Container, Card, CardContent, Chip, useTheme, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatIcon from '@mui/icons-material/Chat';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMG = "https://img.lovepik.com/photo/60178/3864.jpg_wh300.jpg";

const EditProfile = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('userdatachat'));
    const userId = loggedInUser?._id;
    console.log(userId, "userId");

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [profile, setProfile] = useState({
        name: loggedInUser?.name || '',
        surname: loggedInUser?.surname || '',
        username: loggedInUser?.username || '',
        personalPhone: loggedInUser?.personalPhone || '',
        workPhone: loggedInUser?.workPhone || '',
        city: loggedInUser?.city || '',
        country: loggedInUser?.country || '',
        organization: loggedInUser?.organization || '',
        bio: loggedInUser?.bio || '',
        avatar: loggedInUser?.avatar || '',
        email: loggedInUser?.email || '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'edit', 'settings'
    const navigate = useNavigate();

    const token = localStorage.getItem("token")
    console.log(token, "df");

    useEffect(() => {
        // Fetch current user profile
        const fetchProfile = async () => {
            try {
                console.log("Fetching profile for userId:", userId);
                console.log("Using token:", token ? "Token exists" : "No token");
                
                if (!userId || !token) {
                    console.log("Missing userId or token, skipping API call");
                    return;
                }

                const myHeaders = new Headers();
                myHeaders.append("Authorization", `Bearer ${token}`);
                myHeaders.append("Content-Type", "application/json");
                
                const requestOptions = {
                    method: "GET",
                    headers: myHeaders,
                    redirect: "follow"
                };

                console.log("Making API call to:", `http://localhost:5000/api/auth/user/${userId}`);
                console.log("Request headers:", Object.fromEntries(myHeaders.entries()));
                
                const response = await fetch(`http://localhost:5000/api/auth/user/${userId}`, requestOptions);

                console.log("Response status:", response.status);
                console.log("Response headers:", response.headers);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("API Error Response:", errorText);
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }

                const result = await response.json();
                console.log("API Response:", result);

                // Handle different response formats
                if (result.success && result.user) {
                    console.log("Setting profile with user data:", result.user);
                    setProfile(prevProfile => ({
                        ...prevProfile,
                        ...result.user
                    }));
                    setSnackbar({ open: true, message: 'Profile loaded successfully', severity: 'success' });
                } else if (result.data) {
                    console.log("Setting profile with data:", result.data);
                    setProfile(prevProfile => ({
                        ...prevProfile,
                        ...result.data
                    }));
                    setSnackbar({ open: true, message: 'Profile loaded successfully', severity: 'success' });
                } else if (result && typeof result === 'object') {
                    console.log("Setting profile with result:", result);
                    setProfile(prevProfile => ({
                        ...prevProfile,
                        ...result
                    }));
                    setSnackbar({ open: true, message: 'Profile loaded successfully', severity: 'success' });
                } else {
                    console.log("No valid data found in response");
                    setSnackbar({ open: true, message: 'No profile data received', severity: 'warning' });
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setSnackbar({ open: true, message: `Failed to fetch profile: ${error.message}`, severity: 'error' });
            }
        };
        
        fetchProfile();
        
        // Cleanup function to revoke object URLs
        return () => {
            if (avatarFile) {
                URL.revokeObjectURL(avatarFile);
            }
        };
    }, [userId, token]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validate file type
            if (file.type.startsWith('image/')) {
                setAvatarFile(file);
                console.log('Avatar file selected:', file.name);
            } else {
                setSnackbar({ open: true, message: 'Please select a valid image file', severity: 'error' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);
            const formData = new FormData();
            // Only send non-empty fields
            Object.entries(profile).forEach(([key, value]) => {
                if (value !== undefined && value !== '') formData.append(key, value);
            });
            if (avatarFile) formData.append('avatar', avatarFile);
            const res = await axios.patch(`http://localhost:5000/api/auth/update/${userId}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Profile update response:', res.data);
            setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
            setIsEditing(false);
        } catch (err) {
            console.error('Profile update error:', err);
            let msg = 'Failed to update profile';
            if (err.response && err.response.data && err.response.data.message) msg = err.response.data.message;
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Cleanup avatar file
        if (avatarFile) {
            URL.revokeObjectURL(avatarFile);
        }
        setAvatarFile(null);
    };

    const handleLogoutClick = () => {
        setLogoutModalOpen(true);
    };

    const handleLogoutConfirm = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userdatachat');
        setLogoutModalOpen(false);
        navigate('/login');
    };

    const handleLogoutCancel = () => {
        setLogoutModalOpen(false);
    };

    const renderSidebar = () => (
        <Box sx={{
            width: isMobile ? '100%' : 280,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
            minHeight: isMobile ? 'auto' : '100vh',
            position: isMobile ? 'static' : 'fixed',
            left: 0,
            top: 0,
            zIndex: 1000
        }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                    src={profile.avatar || (avatarFile ? URL.createObjectURL(avatarFile) : undefined)}
                    sx={{
                        width: 100,
                        height: 100,
                        mb: 2,
                        border: '4px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                >
                    {profile.name ? profile.name[0].toUpperCase() : <PersonIcon sx={{ fontSize: 40 }} />}
                </Avatar>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                    {profile.name} {profile.surname}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {profile.username || '@username'}
                </Typography>
                {profile.organization && (
                    <Chip
                        label={profile.organization}
                        size="small"
                        sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                )}
            </Box>

            <List sx={{ width: '100%', px: 2 }}>
                <ListItem
                    button
                    onClick={() => setActiveTab('profile')}
                    sx={{
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: activeTab === 'profile' ? 'rgba(255,255,255,0.15)' : undefined,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <ListItemIcon><PersonIcon sx={{ color: 'white' }} /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem
                    button
                    onClick={() => navigate('/chat')}
                    sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <ListItemIcon><ChatIcon sx={{ color: 'white' }} /></ListItemIcon>
                    <ListItemText primary="Chat" />
                </ListItem>
                <ListItem
                    button
                    onClick={() => setActiveTab('settings')}
                    sx={{
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: activeTab === 'settings' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                >
                    <ListItemIcon><SettingsIcon sx={{ color: 'white' }} /></ListItemIcon>
                    <ListItemText primary="Settings" />
                </ListItem>
                <ListItem
                    button
                    onClick={handleLogoutClick}
                    sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <ListItemIcon><LogoutIcon sx={{ color: 'white' }} /></ListItemIcon>
                    <ListItemText primary="Log Out" />
                </ListItem>
            </List>
        </Box>
    );

    const renderProfileCard = () => (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            width: '100%',
            bgcolor: '#fff',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            p: { xs: 2, md: 6 },
            mt: 4
        }}>
            <Box sx={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                mb: 2
            }}>
                <img
                    src={profile.avatar || (avatarFile ? URL.createObjectURL(avatarFile) : undefined) || DEFAULT_IMG}
                    alt={profile.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1, textAlign: 'center' }}>
                {profile.name} {profile.surname}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1, textAlign: 'center' }}>
                {profile.bio || 'No bio provided.'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
                {profile.organization ? `${profile.organization} • ` : ''}{profile.city}{profile.city && profile.country ? ', ' : ''}{profile.country}
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>624</Typography>
                    <Typography variant="caption" color="text.secondary">Views</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>142</Typography>
                    <Typography variant="caption" color="text.secondary">Followers</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700}>104</Typography>
                    <Typography variant="caption" color="text.secondary">Likes</Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button variant="contained" color="primary" sx={{ borderRadius: 2, px: 4, fontWeight: 600 }}>+ Add</Button>
                <Button variant="outlined" color="primary" sx={{ borderRadius: 2, px: 4, fontWeight: 600 }}>Message</Button>
            </Box>
            <Button variant="text" color="secondary" sx={{ mt: 2 }} onClick={() => setActiveTab('edit')}>
                Edit Profile
            </Button>
        </Box>
    );

    const renderSettingsCard = () => (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            width: '100%',
            bgcolor: '#fff',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
            p: { xs: 2, md: 6 },
            mt: 4
        }}>
            <SettingsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight={700} sx={{ mb: 2, textAlign: 'center' }}>
                Settings
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
                Settings coming soon! Here you can add preferences, theme, notifications, etc.
            </Typography>
        </Box>
    );

    const renderMainContent = () => (
        <Box sx={{
            flex: 1,
            p: { xs: 2, md: 4 },
            ml: isMobile ? 0 : '280px',
            minHeight: '100vh',
            bgcolor: '#f8fafc'
        }}>
            <Container maxWidth="sm">
                {activeTab === 'profile' ? (
                    renderProfileCard()
                ) : activeTab === 'settings' ? (
                    renderSettingsCard()
                ) : (
                    <Card sx={{
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            p: 3,
                            position: 'relative'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h4" fontWeight={700}>
                                    Profile Settings
                                </Typography>
                                <Button
                                    variant={isEditing ? "outlined" : "contained"}
                                    startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                                    onClick={() => setIsEditing(!isEditing)}
                                    sx={{
                                        color: isEditing ? 'white' : 'white',
                                        borderColor: 'white',
                                        '&:hover': {
                                            bgcolor: isEditing ? 'rgba(255,255,255,0.1)' : 'primary.dark'
                                        }
                                    }}
                                >
                                    {isEditing ? 'Cancel' : 'Edit Profile'}
                                </Button>
                            </Box>
                        </Box>

                        <CardContent sx={{ p: 4 }}>
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={4}>
                                    {/* Personal Information */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
                                            Personal Information
                                        </Typography>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="First Name"
                                                    name="name"
                                                    value={profile.name}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    disabled={!isEditing}
                                                    sx={{ mb: 2 }}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Last Name"
                                                    name="surname"
                                                    value={profile.surname}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    disabled={!isEditing}
                                                    sx={{ mb: 2 }}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Username"
                                                    name="username"
                                                    value={profile.username}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    disabled={!isEditing}
                                                    sx={{ mb: 2 }}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Email"
                                                    name="email"
                                                    value={profile.email}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    disabled={!isEditing}
                                                    sx={{ mb: 2 }}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Bio"
                                                    name="bio"
                                                    value={profile.bio}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    disabled={!isEditing}
                                                    sx={{ mb: 2 }}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Contact & Location */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
                                            Contact & Location
                                        </Typography>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Personal Phone"
                                                    name="personalPhone"
                                                    value={profile.personalPhone}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    disabled={!isEditing}
                                                    sx={{ mb: 2 }}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Work Phone"
                                                    name="workPhone"
                                                    value={profile.workPhone}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    disabled={!isEditing}
                                                    sx={{ mb: 2 }}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="City"
                                                    name="city"
                                                    value={profile.city}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    disabled={!isEditing}
                                                    sx={{ mb: 2 }}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Country"
                                                    name="country"
                                                    value={profile.country}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    disabled={!isEditing}
                                                    sx={{ mb: 2 }}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Organization"
                                                    name="organization"
                                                    value={profile.organization}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    disabled={!isEditing}
                                                    sx={{ mb: 2 }}
                                                    InputProps={{
                                                        sx: { borderRadius: 2 }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Profile Picture */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'primary.main' }}>
                                            Profile Picture
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                                            <Avatar
                                                src={profile.avatar || (avatarFile ? URL.createObjectURL(avatarFile) : undefined)}
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    border: '4px solid #e3f2fd',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {profile.name ? profile.name[0].toUpperCase() : <PersonIcon sx={{ fontSize: 50 }} />}
                                            </Avatar>
                                            {isEditing && (
                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                    startIcon={<PhotoCameraIcon />}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    Upload New Photo
                                                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                                                </Button>
                                            )}
                                            {avatarFile && (
                                                <Chip
                                                    label={avatarFile.name}
                                                    onDelete={() => setAvatarFile(null)}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>
                                    </Grid>



                                    {/* Submit Button */}
                                    {isEditing && (
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    size="large"
                                                    startIcon={<SaveIcon />}
                                                    disabled={loading}
                                                    sx={{
                                                        px: 4,
                                                        py: 1.5,
                                                        borderRadius: 2,
                                                        fontWeight: 600,
                                                        fontSize: '1.1rem'
                                                    }}
                                                >
                                                    {loading ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="large"
                                                    onClick={handleCancel}
                                                    disabled={loading}
                                                    sx={{
                                                        px: 4,
                                                        py: 1.5,
                                                        borderRadius: 2,
                                                        fontWeight: 600,
                                                        fontSize: '1.1rem'
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </Container>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {isMobile ? (
                <Box sx={{ width: '100%' }}>
                    {renderSidebar()}
                    {renderMainContent()}
                </Box>
            ) : (
                <>
                    {renderSidebar()}
                    {renderMainContent()}
                </>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={() => setSnackbar({ ...snackbar, open: false })}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />

            {/* Logout Confirmation Modal */}
            <Dialog
                open={logoutModalOpen}
                onClose={handleLogoutCancel}
                aria-labelledby="logout-dialog-title"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        minWidth: 400
                    }
                }}
            >
                <DialogTitle id="logout-dialog-title" sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.2rem'
                }}>
                    Confirm Logout
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to logout? You will be redirected to the login page.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button 
                        onClick={handleLogoutCancel}
                        variant="outlined"
                        sx={{ 
                            borderRadius: 2,
                            px: 3,
                            fontWeight: 600
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleLogoutConfirm}
                        variant="contained"
                        color="error"
                        sx={{ 
                            borderRadius: 2,
                            px: 3,
                            fontWeight: 600
                        }}
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EditProfile; 