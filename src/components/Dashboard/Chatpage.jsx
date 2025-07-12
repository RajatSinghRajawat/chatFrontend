import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Box, Drawer, List, ListItem, ListItemAvatar, ListItemText, Avatar, Typography, Divider, CircularProgress, TextField, Button, Dialog, DialogTitle, DialogContent, IconButton, Stack, Paper, AppBar, Toolbar, InputAdornment, Badge, ListItemButton, ListSubheader, Collapse, Grid
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PostAddIcon from '@mui/icons-material/PostAdd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContactsIcon from '@mui/icons-material/Contacts';
import CallIcon from '@mui/icons-material/Call';
import NightlightIcon from '@mui/icons-material/Nightlight';
import './chatpage-scrollbar-hide.css';
import UserProfile from './UserProfile';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircleIcon from '@mui/icons-material/Circle'; // For online dot
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import dayjs from 'dayjs';

const loggedInUser = JSON.parse(localStorage.getItem('userdatachat'));
const myId = loggedInUser?._id;

const Chatpage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [myProfileOpen, setMyProfileOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showDocs, setShowDocs] = useState(true);
  const [showMedia, setShowMedia] = useState(true);
  const [showPosts, setShowPosts] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const socket = useRef();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [messageToEdit, setMessageToEdit] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [contextMenu, setContextMenu] = useState(null); // { mouseX, mouseY, message }
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    socket.current = io('http://localhost:5000'); // backend URL
    socket.current.on('new_message', (data) => {
      toast.info(`New message from ${data.senderName || 'someone'}`);
      // Optionally: setMessages(prev => [...prev, data.message]);
    });
    socket.current.on('edit_message', (data) => {
      toast.info('A message was edited');
      // Optionally: update message in state
    });
    socket.current.on('delete_message', (data) => {
      toast.info('A message was deleted');
      // Optionally: remove message from state
    });
    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please login again.');
          setLoadingUsers(false);
          return;
        }
        const res = await axios.get('http://localhost:5000/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    const fetchAndMarkRead = async () => {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please login again.');
          setLoadingMessages(false);
          return;
        }
        // Mark messages as read when opening chat
        await axios.post(`http://localhost:5000/api/messages/mark-read/${selectedUser._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Update unread count for this user in state
        setUsers((prev) => prev.map((u) => u._id === selectedUser._id ? { ...u, unread: 0 } : u));
        // Fetch messages
        const res = await axios.get(`http://localhost:5000/api/messages/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        setError('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchAndMarkRead();
  }, [selectedUser]);

  useEffect(() => {
    if (!socket.current) return;
    socket.current.on('user_online', (userId) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, online: true } : u))
      );
    });
    socket.current.on('user_offline', (userId) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, online: false } : u))
      );
    });
    return () => {
      socket.current.off('user_online');
      socket.current.off('user_offline');
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/messages/send/${selectedUser._id}`,
        { content: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      setMessage('');
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleProfileOpen = (user) => {
    setProfileUser(user);
    setProfileOpen(true);
  };
  const handleProfileClose = () => {
    setProfileOpen(false);
    setProfileUser(null);
  };
  const handleMyProfileOpen = () => setMyProfileOpen(true);
  const handleMyProfileClose = () => setMyProfileOpen(false);
  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);
  const toggleDocs = () => setShowDocs((v) => !v);
  const toggleMedia = () => setShowMedia((v) => !v);
  const togglePosts = () => setShowPosts((v) => !v);

  const handleDeleteClick = (msg) => {
    setMessageToDelete(msg);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!messageToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/messages/${messageToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((m) => m._id !== messageToDelete._id));
      toast.success('Message deleted!');
    } catch (err) {
      toast.error('Failed to delete message');
    }
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };
  const handleEditClick = (msg) => {
    setMessageToEdit(msg);
    setEditContent(msg.content);
    setEditDialogOpen(true);
  };
  const handleEditSave = async () => {
    if (!messageToEdit) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`http://localhost:5000/api/messages/${messageToEdit._id}`, { content: editContent }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.map((m) => m._id === messageToEdit._id ? { ...m, content: res.data.message.content } : m));
      toast.success('Message updated!');
    } catch (err) {
      toast.error('Failed to update message');
    }
    setEditDialogOpen(false);
    setMessageToEdit(null);
    setEditContent('');
  };
  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setMessageToEdit(null);
    setEditContent('');
  };

  const toggleSelectMode = () => setSelectMode((v) => !v);
  const handleSelectMessage = (msgId) => {
    setSelectedMessages((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
  };
  const handleDeleteSelected = async () => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedMessages.map(id =>
        axios.delete(`http://localhost:5000/api/messages/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ));
      setMessages((prev) => prev.filter((m) => !selectedMessages.includes(m._id)));
      setSelectedMessages([]);
      setSelectMode(false);
      toast.success('Selected messages deleted!');
    } catch (err) {
      toast.error('Failed to delete selected messages');
    }
  };

  return (
    <>
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#18192A', fontFamily: 'Poppins, sans-serif' }}>
      <Box sx={{ width: 80, bgcolor: '#191A2F', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', py: 3, gap: 2 }}>
        <IconButton size="large" sx={{ color: '#fff', mb: 2 }} onClick={handleDrawerOpen}><MenuIcon /></IconButton>
        <IconButton size="large" sx={{ color: '#fff', mb: 2 }}><ChatIcon /></IconButton>
        <IconButton size="large" sx={{ color: '#fff', mb: 2 }}><GroupIcon /></IconButton>
        <IconButton size="large" sx={{ color: '#fff', mb: 2 }}><SettingsIcon /></IconButton>
      </Box>
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose} PaperProps={{ sx: { bgcolor: '#23243a', color: '#fff', width: 320, fontFamily: 'Inter, Roboto, system-ui, sans-serif' } }}>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Avatar src={loggedInUser?.avatar} sx={{ width: 72, height: 72 }} />
          <Typography fontWeight={700} fontSize={20}>{loggedInUser?.name}</Typography>
          <Typography color="#aaa" fontSize={14}>{loggedInUser?.email}</Typography>
          <Button fullWidth variant="outlined" sx={{ mt: 2, color: '#fff', borderColor: '#4F8CFF' }} onClick={() => { handleDrawerClose(); navigate('/profile/me'); }}>My Profile</Button>
          <Button fullWidth sx={{ color: '#fff' }} startIcon={<GroupIcon />}>New Group</Button>
          <Button fullWidth sx={{ color: '#fff' }} startIcon={<ContactsIcon />}>Contacts</Button>
          <Button fullWidth sx={{ color: '#fff' }} startIcon={<CallIcon />}>Calls</Button>
          <Button fullWidth sx={{ color: '#fff' }} startIcon={<SettingsIcon />}>Settings</Button>
          <Button fullWidth sx={{ color: '#fff' }} startIcon={<NightlightIcon />}>Night Mode</Button>
        </Box>
      </Drawer>
      <Box sx={ { width: 340, bgcolor: '#23243a', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', borderRight: '1px solid #23243a', boxShadow: 3 }}>
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography variant="body2" color="#aaa" sx={{ mb: 1, fontWeight: 500 }}>{loggedInUser?.email}</Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Search Message..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#aaa' }} />
                </InputAdornment>
              ),
              sx: { bgcolor: '#23243a', borderRadius: 2, color: '#fff' },
            }}
            sx={{ mb: 2 }}
          />
        </Box>
        <Divider sx={{ borderColor: '#23243a', mb: 1 }} />
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <List
            subheader={<ListSubheader sx={{ bgcolor: 'transparent', color: '#aaa', fontWeight: 700, fontSize: 16 }}>Direct Message</ListSubheader>}
            sx={{ flex: 1, overflowY: 'auto', bgcolor: 'transparent', px: 1 }}
            className="hide-scrollbar"
          >
            {loadingUsers ? (
              <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
                <CircularProgress color="primary" />
              </Stack>
            ) : error ? (
              <Typography color="error" sx={{ p: 2 }}>{error}</Typography>
            ) : users.length === 0 ? (
              <Typography color="#aaa" sx={{ p: 2 }}>No users found</Typography>
            ) : (
              users.map((user) => {
                const lastMsg = user.lastMessage || '';
                const lastMsgSender = user.lastMessageSender === myId ? 'You' : user.name;
                const lastMsgTime = user.lastMessageTime ? dayjs(user.lastMessageTime).format('HH:mm') : '';
                const showUnread = user.unread && user.lastMessageSender !== myId;
                return (
                  <ListItemButton
                    key={user._id}
                    selected={selectedUser && selectedUser._id === user._id}
                    onClick={() => setSelectedUser(user)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: selectedUser && selectedUser._id === user._id ? '#2D2E4A' : 'transparent',
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: '#23243a' },
                      color: '#fff',
                      alignItems: 'center',
                      minHeight: 72,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.avatar}
                        alt={user.name}
                        sx={{ boxShadow: 2, width: 48, height: 48 }}
                      >
                        {user.name ? user.name[0] : <PersonIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography fontWeight={600} sx={{ color: '#fff', display: 'inline' }}>
                              {user.name}
                            </Typography>
                            {user.personalPhone || user.username ? (
                              <Typography variant="body2" sx={{ color: '#aaa', display: 'inline', ml: 1 }}>
                                {user.personalPhone || user.username}
                              </Typography>
                            ) : null}
                          </Box>
                          <Typography variant="caption" sx={{ color: '#4F8CFF', ml: 2, minWidth: 36, textAlign: 'right' }}>
                            {lastMsgTime}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: '#aaa', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lastMsg ? (
                              <>
                                <span style={{ color: '#4F8CFF', fontWeight: 500 }}>{lastMsgSender === 'You' ? 'You: ' : ''}</span>
                                {lastMsg}
                              </>
                            ) : (user.bio || '')}
                          </Typography>
                          {showUnread && (
                            <Badge color="success" badgeContent={user.unread} sx={{ ml: 2 }} />
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                );
              })
            )}
          </List>
        </Box>
      </Box>
      <Box sx={{ flex: selectedUser ? 1 : 'auto', display: 'flex', flexDirection: 'column', bgcolor: '#23243a', borderRadius: 4, m: 2, boxShadow: 6, overflow: 'hidden', width: selectedUser ? 'auto' : '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#23243a', borderBottom: '1px solid #23243a', minHeight: 72, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {selectedUser && (
              <Avatar src={selectedUser.avatar} sx={{ width: 48, height: 48, mr: 2 }}>
                {selectedUser.name ? selectedUser.name[0] : <PersonIcon />}
              </Avatar>
            )}
            <Box>
              <Typography fontWeight={700} color="#fff" fontSize={18}>
                {selectedUser ? selectedUser.name : 'Select a user to start chatting'}
              </Typography>
              {selectedUser && <Typography fontSize={14} color="#7CFCB6">Online</Typography>}
            </Box>
          </Box>
          <IconButton onClick={handleMyProfileOpen} sx={{ ml: 2 }}>
            <Avatar src={loggedInUser?.avatar} sx={{ width: 40, height: 40 }}>
              {loggedInUser?.name ? loggedInUser.name[0] : <AccountCircleIcon />}
            </Avatar>
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#23243a' }} className="hide-scrollbar">
          {loadingMessages ? (
            <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
              <CircularProgress color="primary" />
            </Stack>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : messages.length === 0 ? (
            <Typography color="#aaa">No messages yet</Typography>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                // msg.sender can be an object or string, handle both
                const senderId = typeof msg.sender === 'object' && msg.sender !== null
                  ? msg.sender._id
                  : msg.sender;
                const isMine = senderId === myId;

                return (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, x: isMine ? 60 : -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isMine ? 60 : -60 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                      alignItems: 'center',
                      fontFamily: 'Poppins, sans-serif',
                      gap: 8,
                    }}
                  >
                    {selectMode && (
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(msg._id)}
                        onChange={() => handleSelectMessage(msg._id)}
                        style={{ marginRight: 8 }}
                      />
                    )}
                    {isMine ? (
                      <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative' }}>
                          <Paper
                            elevation={6}
                            sx={{
                              px: 2, py: 1.5, maxWidth: 340, borderRadius: 3,
                              bgcolor: '#4F8CFF',
                              color: '#fff',
                              fontSize: 16,
                              wordBreak: 'break-word',
                              borderTopRightRadius: 8,
                              borderTopLeftRadius: 24,
                              borderBottomRightRadius: 24,
                              borderBottomLeftRadius: 24,
                              boxShadow: 6,
                            }}
                          >
                            {msg.content}
                          </Paper>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#aaa',
                              mt: 0.5,
                              mr: 1,
                              display: 'block',
                              textAlign: 'right',
                              fontFamily: 'Poppins, sans-serif'
                            }}
                          >
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          sx={{ color: '#fff', opacity: 0.7 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenu({
                              mouseX: e.clientX - 2,
                              mouseY: e.clientY - 4,
                              message: msg,
                            });
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative' }}>
                          <Paper
                            elevation={2}
                            sx={{
                              px: 2, py: 1.5, maxWidth: 340, borderRadius: 3,
                              bgcolor: '#23244a',
                              color: '#fff',
                              fontSize: 16,
                              wordBreak: 'break-word',
                              borderTopRightRadius: 24,
                              borderTopLeftRadius: 8,
                              borderBottomRightRadius: 24,
                              borderBottomLeftRadius: 24,
                              boxShadow: 2,
                            }}
                          >
                            {msg.content}
                          </Paper>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#aaa',
                              ml: 1,
                              display: 'block',
                              textAlign: 'left',
                              fontFamily: 'Poppins, sans-serif'
                            }}
                          >
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </Box>
        {selectedUser && (
          <Box component="form" onSubmit={handleSend} sx={{ p: 2, bgcolor: '#23243a', borderTop: '1px solid #23243a', display: 'flex', gap: 2 }}>
            <TextField
              type="text"
              fullWidth
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              variant="outlined"
              sx={{ borderRadius: 2, bgcolor: '#23243a', color: '#fff', input: { color: '#fff' } }}
            />
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{ borderRadius: 2, fontWeight: 600, px: 4, bgcolor: '#4F8CFF', color: '#fff', boxShadow: '0 4px 24px 0 #4F8CFF40', textTransform: 'none', fontSize: 16 }}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </motion.div>
          </Box>
        )}
      </Box>
      <Dialog open={profileOpen} onClose={handleProfileClose} maxWidth="xs" fullWidth TransitionComponent={motion.div} TransitionProps={{ initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.8, opacity: 0 }, transition: { duration: 0.3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={profileUser?.avatar} sx={{ width: 56, height: 56, mr: 2 }}>
            {profileUser?.name ? profileUser.name[0] : <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="h6">{profileUser?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{profileUser?.email}</Typography>
          </Box>
          <Box flex={1} />
          <IconButton onClick={handleProfileClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>About</Typography>
          <Typography variant="body2" color="text.secondary">User ID: {profileUser?._id}</Typography>
        </DialogContent>
      </Dialog>
      <Dialog open={myProfileOpen} onClose={handleMyProfileClose} maxWidth="xs" fullWidth TransitionComponent={motion.div} TransitionProps={{ initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.8, opacity: 0 }, transition: { duration: 0.3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={loggedInUser?.avatar} sx={{ width: 56, height: 56, mr: 2 }}>
            {loggedInUser?.name ? loggedInUser.name[0] : <AccountCircleIcon />}
          </Avatar>
          <Box>
            <Typography variant="h6">{loggedInUser?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{loggedInUser?.email}</Typography>
          </Box>
          <Box flex={1} />
          <IconButton onClick={handleMyProfileClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <UserProfile
            user={loggedInUser}
            online={true}
            sharedMedia={[]}
            sharedDocs={[]}
            sharedPosts={[]}
            onMessage={() => {}}
            onCall={() => {}}
            onBlock={() => {}}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Message?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this message?</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={editDialogOpen} onClose={handleEditCancel}>
        <DialogTitle>Edit Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Edit your message"
            type="text"
            fullWidth
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={handleEditCancel}>Cancel</Button>
            <Button onClick={handleEditSave} color="primary" variant="contained">Save</Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Menu
        open={!!contextMenu}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {contextMenu && contextMenu.message &&
          (typeof contextMenu.message.sender === 'object'
            ? contextMenu.message.sender._id
            : contextMenu.message.sender) === myId && (
            <MenuItem onClick={() => { handleEditClick(contextMenu.message); setContextMenu(null); }}>Edit</MenuItem>
          )}
        <MenuItem onClick={() => { handleDeleteClick(contextMenu.message); setContextMenu(null); }}>Delete</MenuItem>
        <MenuItem onClick={() => { toggleSelectMode(); setContextMenu(null); }}>{selectMode ? 'Cancel Select' : 'Select'}</MenuItem>
        {/* Add more options as needed, e.g., Reply, Copy, Forward */}
      </Menu>
      {selectMode && selectedMessages.length > 0 && (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: '#23243a', p: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button color="error" variant="contained" onClick={handleDeleteSelected}>
            Delete Selected ({selectedMessages.length})
          </Button>
          <Button onClick={toggleSelectMode}>Cancel</Button>
        </Box>
      )}
    </Box>
    <ToastContainer position="bottom-right" />
    </>
  );
};

export default Chatpage;