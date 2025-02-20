import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Footbar from "./components/footbar.jsx";
import Messages from "./components/co-components/messages.jsx";
import Search from "./components/co-components/search.jsx";
import Random from "./components/co-components/random.jsx";
import Profile from "./components/co-components/profile.jsx";
import Notification from "./components/co-components/notification.jsx";

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/random" />} />
            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <Search name="Search" />
                </PrivateRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PrivateRoute>
                  <Messages name="Messages" />
                </PrivateRoute>
              }
            />
            <Route
              path="/random"
              element={
                <PrivateRoute>
                  <Random name="Random" />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile name="Profile" />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <Notification name="Notifications" />
                </PrivateRoute>
              }
            />
          </Routes>
          <Footbar />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
