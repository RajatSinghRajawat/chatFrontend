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
import AttachFileIcon from '@mui/icons-material/AttachFile';
import debounce from 'lodash.debounce';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const loggedInUser = JSON.parse(localStorage.getItem('userdatachat'));
const myId = loggedInUser?._id;

const STATIC_IMG = "https://img.lovepik.com/photo/60178/3864.jpg_wh300.jpg";

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
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [files, setFiles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupCreating, setGroupCreating] = useState(false);
  const [groupError, setGroupError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    socket.current = io('http://localhost:5000'); // backend URL
    socket.current.on('new_message', (data) => {
      // If the message is from the currently selected user, just add to messages
      if (selectedUser && data.senderId === selectedUser._id) {
        setMessages(prev => [...prev, data.message]);
      } else {
        // Otherwise, increment unread count for that user
        setUsers(prev =>
          prev.map(u =>
            u._id === data.senderId
              ? { ...u, unread: (u.unread || 0) + 1 }
              : u
          )
        );
      }
      toast.info(`New message from ${data.senderName || 'someone'}`);
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
  }, [selectedUser]);

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

  // Fetch groups from API
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/groups', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch group messages when selectedGroup changes
  useEffect(() => {
    if (!selectedGroup) return;
    setSelectedUser(null); // Deselect user if group selected
    const fetchGroupMessages = async () => {
      setLoadingMessages(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/messages/group/${selectedGroup._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        setError('Failed to load group messages');
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchGroupMessages();
  }, [selectedGroup]);

  // Socket.io for group messages
  useEffect(() => {
    if (!socket.current) return;
    socket.current.on('new_group_message', (data) => {
      if (selectedGroup && data.groupId === selectedGroup._id) {
        setMessages(prev => [...prev, data.message]);
      }
      // Optionally: show notification if not in this group
    });
    return () => {
      socket.current.off('new_group_message');
    };
  }, [selectedGroup]);

  // Group creation dialog logic
  const handleOpenGroupDialog = () => {
    setGroupDialogOpen(true);
    setGroupName('');
    setGroupMembers([myId]);
    setGroupError('');
  };
  const handleCloseGroupDialog = () => {
    setGroupDialogOpen(false);
    setGroupName('');
    setGroupMembers([myId]);
    setGroupError('');
  };
  const handleToggleGroupMember = (userId) => {
    setGroupMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setGroupError('Group name is required');
      return;
    }
    if (groupMembers.length < 2) {
      setGroupError('Select at least 2 members');
      return;
    }
    setGroupCreating(true);
    setGroupError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/groups/create', {
        name: groupName,
        members: groupMembers,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchGroups(); // Always fetch latest groups after creation
      setGroupDialogOpen(false);
      toast.success('Group created!');
    } catch (err) {
      setGroupError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setGroupCreating(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (q, token) => {
      if (!q) {
        setSearching(false);
        const res = await axios.get('http://localhost:5000/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        return;
      }
      setSearching(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/search?q=${encodeURIComponent(q)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError('Failed to search users');
      } finally {
        setSearching(false);
      }
    }, 400)
  ).current;

  useEffect(() => {
    const token = localStorage.getItem('token');
    debouncedSearch(searchTerm, token);
    return () => debouncedSearch.cancel();
  }, [searchTerm]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!message.trim() && files.length === 0) || (!selectedUser && !selectedGroup)) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      let res;
      if (selectedGroup) {
        // Group message
        const formData = new FormData();
        files.forEach(file => formData.append('image', file));
        if (message.trim()) formData.append('content', message);
        res = await axios.post(
          `http://localhost:5000/api/messages/send-group/${selectedGroup._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        if (files.length > 0) {
          const formData = new FormData();
          files.forEach(file => formData.append('image', file));
          if (message.trim()) formData.append('content', message);
          res = await axios.post(
            `http://localhost:5000/api/messages/send/${selectedUser._id}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
        } else {
          res = await axios.post(
            `http://localhost:5000/api/messages/send/${selectedUser._id}`,
            { content: message },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
      setMessages((prev) => [...prev, res.data]);
      setMessage('');
      setFiles([]);
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
      {/* Sidebar */}
      <Box sx={{ width: 340, bgcolor: '#23243a', display: { xs: 'none', md: 'flex' }, flexDirection: 'column', borderRight: '1px solid #23243a', boxShadow: 3 }}>
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography variant="body2" color="#aaa" sx={{ mb: 1, fontWeight: 500 }}>{loggedInUser?.email}</Typography>
          <TextField
            size="small"
            fullWidth
            placeholder="Search user..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
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
          {/* GROUPS HEADING AND LIST */}
          <Typography variant="h6" sx={{ color: '#4F8CFF', fontWeight: 700, px: 2, pt: 1, pb: 0.5, letterSpacing: 1 }}>
            Groups
          </Typography>
          <List
            sx={{ flex: 0, overflowY: 'auto', bgcolor: 'transparent', px: 1 }}
            className="hide-scrollbar"
          >
            {groups.length === 0 ? (
              <Typography color="#aaa" sx={{ p: 2 }}>No groups found</Typography>
            ) : (
              groups.map((group) => (
                <ListItemButton
                  key={group._id}
                  selected={selectedGroup && selectedGroup._id === group._id}
                  onClick={() => { setSelectedGroup(group); setSelectedUser(null); }}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: selectedGroup && selectedGroup._id === group._id ? '#2D2E4A' : 'transparent',
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: '#23243a' },
                    color: '#fff',
                    alignItems: 'center',
                    minHeight: 64,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={group.avatar || STATIC_IMG}>{group.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography fontWeight={600} sx={{ color: '#fff', display: 'inline' }}>
                        {group.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: '#aaa' }}>
                        {group.members.length} members
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))
            )}
          </List>
          <Divider sx={{ borderColor: '#23243a', my: 1 }} />
          {/* DIRECT MESSAGE LIST BELOW GROUPS */}
          <List
            subheader={<ListSubheader sx={{ bgcolor: 'transparent', color: '#aaa', fontWeight: 700, fontSize: 16 }}>Direct Message</ListSubheader>}
            sx={{ flex: 1, overflowY: 'auto', bgcolor: 'transparent', px: 1 }}
            className="hide-scrollbar"
          >
            {searchTerm && !loadingUsers && users.length === 0 ? (
              <Typography color="#aaa" sx={{ p: 2 }}>No users found for "{searchTerm}"</Typography>
            ) : loadingUsers ? (
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
                const isSelected = selectedUser && selectedUser._id === user._id;
                return (
                  <ListItemButton
                    key={user._id}
                    selected={isSelected}
                    onClick={() => setSelectedUser(user)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      bgcolor:
                        isSelected
                          ? '#2D2E4A'
                          : user.unread > 0
                          ? '#1e2e1e'
                          : 'transparent',
                      transition: 'background 0.2s',
                      '&:hover': { bgcolor: '#23243a' },
                      color: '#fff',
                      alignItems: 'center',
                      minHeight: 72,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={STATIC_IMG}
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
              <Avatar src={STATIC_IMG} sx={{ width: 48, height: 48, mr: 2 }}>
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
            <Avatar src={loggedInUser?.avatar || STATIC_IMG} sx={{ width: 40, height: 40 }}>
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
                            {msg.fileUrls && msg.fileUrls.length > 0 ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {msg.fileUrls.map((url, idx) =>
                                  msg.type === 'image' || (msg.type === 'mixed' && url.match(/\.(jpg|jpeg|png|gif|avif)$/i)) ? (
                                    <img key={idx} src={url} alt="sent-img" style={{ maxWidth: 200, maxHeight: 400, borderRadius: 8, objectFit: 'contain' }} />
                                  ) : msg.type === 'video' || (msg.type === 'mixed' && url.match(/\.mp4$/i)) ? (
                                    <video key={idx} src={url} controls style={{ maxWidth: 200, maxHeight: 400, borderRadius: 8, objectFit: 'contain' }} />
                                  ) : null
                                )}
                              </Box>
                            ) : (
                              msg.content
                            )}
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
                            {msg.fileUrls && msg.fileUrls.length > 0 ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {msg.fileUrls.map((url, idx) =>
                                  msg.type === 'image' || (msg.type === 'mixed' && url.match(/\.(jpg|jpeg|png|gif|avif)$/i)) ? (
                                    <img key={idx} src={url} alt="sent-img" style={{ maxWidth: 200, maxHeight: 400, borderRadius: 8, objectFit: 'contain' }} />
                                  ) : msg.type === 'video' || (msg.type === 'mixed' && url.match(/\.mp4$/i)) ? (
                                    <video key={idx} src={url} controls style={{ maxWidth: 200, maxHeight: 400, borderRadius: 8, objectFit: 'contain' }} />
                                  ) : null
                                )}
                              </Box>
                            ) : (
                              msg.content
                            )}
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
            <IconButton component="label" sx={{ color: '#fff' }}>
              <AttachFileIcon />
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                multiple
                onChange={e => setFiles(Array.from(e.target.files))}
              />
            </IconButton>
            {files.length > 0 && (
              <Box sx={{ color: '#fff', display: 'flex', alignItems: 'center', fontSize: 12, ml: 1, gap: 1, flexWrap: 'wrap' }}>
                {files.map((file, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, marginRight: 4 }} />
                    ) : file.type.startsWith('video/') ? (
                      <video src={URL.createObjectURL(file)} style={{ width: 32, height: 32, borderRadius: 4, marginRight: 4 }} />
                    ) : null}
                    <span>{file.name}</span>
                  </Box>
                ))}
                <IconButton size="small" onClick={() => setFiles([])} sx={{ color: '#fff' }}><CloseIcon fontSize="small" /></IconButton>
              </Box>
            )}
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
          <Avatar src={STATIC_IMG} sx={{ width: 56, height: 56, mr: 2 }}>
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
          <Avatar src={STATIC_IMG} sx={{ width: 56, height: 56, mr: 2 }}>
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
      <Dialog open={groupDialogOpen} onClose={handleCloseGroupDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Create New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            disabled={groupCreating}
            error={!!groupError && !groupName.trim()}
            helperText={!!groupError && !groupName.trim() ? groupError : ''}
          />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Select Members</Typography>
          <List dense sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {users.map(user => (
              <ListItem key={user._id} button onClick={() => handleToggleGroupMember(user._id)} disabled={user._id === myId}>
                <ListItemAvatar>
                  <Avatar src={STATIC_IMG}>{user.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.name} secondary={user.email} />
                <input
                  type="checkbox"
                  checked={groupMembers.includes(user._id)}
                  onChange={() => handleToggleGroupMember(user._id)}
                  disabled={user._id === myId}
                  style={{ marginLeft: 8 }}
                />
              </ListItem>
            ))}
          </List>
          {groupError && (
            <Typography color="error" sx={{ mt: 1 }}>{groupError}</Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={handleCloseGroupDialog} disabled={groupCreating}>Cancel</Button>
            <Button onClick={handleCreateGroup} color="primary" variant="contained" disabled={groupCreating}>
              {groupCreating ? 'Creating...' : 'Create'}
            </Button>
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