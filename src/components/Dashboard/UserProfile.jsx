import React from 'react';
import { Box, Avatar, Typography, Stack, Button, Divider, IconButton, Collapse, Paper, ListSubheader } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CallIcon from '@mui/icons-material/Call';
import MessageIcon from '@mui/icons-material/Message';
import BlockIcon from '@mui/icons-material/Block';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const UserProfile = ({ user, sharedMedia = [], sharedDocs = [], sharedPosts = [], online = true, onMessage, onCall, onBlock }) => {
  const [showDocs, setShowDocs] = React.useState(true);
  const [showMedia, setShowMedia] = React.useState(true);
  const [showPosts, setShowPosts] = React.useState(true);

  if (!user) return null;

  return (
    <Box sx={{ p: 3, color: '#fff', fontFamily: 'Poppins, sans-serif', width: '100%' }}>
      <Stack alignItems="center" spacing={2}>
        <Avatar src={user.avatar} sx={{ width: 100, height: 100, mb: 1, fontSize: 40 }}>
          {user.name ? user.name[0] : user.email[0]}
        </Avatar>
        <Typography fontWeight={700} fontSize={24}>{user.name}</Typography>
        <Typography color="#aaa" fontSize={16}>{user.email}</Typography>
        <Typography color={online ? '#7CFCB6' : '#aaa'} fontSize={15}>{online ? 'Online' : 'Offline'}</Typography>
        {user.bio && <Typography color="#aaa" fontSize={15} textAlign="center">{user.bio}</Typography>}
        <Stack direction="row" spacing={2} mt={1}>
          <Button variant="contained" color="primary" startIcon={<MessageIcon />} onClick={onMessage} sx={{ textTransform: 'none', fontWeight: 600 }}>Message</Button>
          <IconButton color="success" onClick={onCall}><CallIcon /></IconButton>
          <IconButton color="error" onClick={onBlock}><BlockIcon /></IconButton>
        </Stack>
        <Divider sx={{ width: '100%', my: 2, bgcolor: '#23244a' }} />
      </Stack>
      {/* Shared Document Section */}
      <Box>
        <ListSubheader onClick={() => setShowDocs((v) => !v)} sx={{ bgcolor: 'transparent', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', px: 0, py: 2 }}>
          Shared Document {showDocs ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListSubheader>
        <Collapse in={showDocs} timeout="auto" unmountOnExit>
          <Stack direction="row" spacing={1} pb={2}>
            {sharedDocs.length === 0 ? <Typography color="#aaa">No documents</Typography> : sharedDocs.map((doc, i) => (
              <Paper key={i} sx={{ width: 60, height: 60, bgcolor: '#23244a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{doc.type === 'pdf' ? 'PDF' : 'DOCX'}</Paper>
            ))}
          </Stack>
        </Collapse>
      </Box>
      {/* Shared Media Section */}
      <Box>
        <ListSubheader onClick={() => setShowMedia((v) => !v)} sx={{ bgcolor: 'transparent', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', px: 0, py: 2 }}>
          Shared Media {showMedia ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListSubheader>
        <Collapse in={showMedia} timeout="auto" unmountOnExit>
          <Stack direction="row" spacing={1} pb={2}>
            {sharedMedia.length === 0 ? <Typography color="#aaa">No media</Typography> : sharedMedia.map((img, i) => (
              <Paper key={i} sx={{ width: 60, height: 60, bgcolor: '#23244a', backgroundImage: `url(${img})`, backgroundSize: 'cover' }} />
            ))}
          </Stack>
        </Collapse>
      </Box>
      {/* Shared Post Section */}
      <Box>
        <ListSubheader onClick={() => setShowPosts((v) => !v)} sx={{ bgcolor: 'transparent', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', px: 0, py: 2 }}>
          Shared Post {showPosts ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListSubheader>
        <Collapse in={showPosts} timeout="auto" unmountOnExit>
          <Stack direction="row" spacing={1} pb={2}>
            {sharedPosts.length === 0 ? <Typography color="#aaa">No posts</Typography> : sharedPosts.map((img, i) => (
              <Paper key={i} sx={{ width: 60, height: 60, bgcolor: '#23244a', backgroundImage: `url(${img})`, backgroundSize: 'cover' }} />
            ))}
          </Stack>
        </Collapse>
      </Box>
      {/* About/Meta */}
      <Divider sx={{ width: '100%', my: 2, bgcolor: '#23244a' }} />
      <Stack spacing={1}>
        {user.joined && <Typography color="#aaa" fontSize={13}>Joined: {new Date(user.joined).toLocaleDateString()}</Typography>}
        {user.lastSeen && <Typography color="#aaa" fontSize={13}>Last seen: {new Date(user.lastSeen).toLocaleString()}</Typography>}
      </Stack>
    </Box>
  );
};

export default UserProfile; 