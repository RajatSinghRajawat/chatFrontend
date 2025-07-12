import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/Authentication/LoginPage';
import SignupPage from './components/Authentication/SignupPage';
import Chatpage from './components/Dashboard/Chatpage';
import ProfilePage from './components/Dashboard/ProfilePage';
import EditProfile from './components/Dashboard/EditProfile';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/chat" element={<Chatpage />} />
        <Route path="/profile/me" element={<ProfilePage  />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;