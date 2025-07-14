import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './components/Authentication/LoginPage';
import SignupPage from './components/Authentication/SignupPage';
import Chatpage from './components/Dashboard/Chatpage';
import ProfilePage from './components/Dashboard/ProfilePage';
import EditProfile from './components/Dashboard/EditProfile';

function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('userdatachat');
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function PublicRoute() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('userdatachat');
  if (token && user) {
    return <Navigate to="/chat" replace />;
  }
  return <Outlet />;
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chatpage />} />
          <Route path="/profile/me" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;