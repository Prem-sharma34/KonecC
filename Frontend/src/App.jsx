import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Footbar from "./components/footbar.jsx";
import Messages from "./components/co-components/messages.jsx";
import Search from "./components/co-components/search.jsx";
import Random from "./components/co-components/random.jsx";
import Profile from "./components/co-components/profile.jsx";
import Notification from "./components/co-components/notification.jsx";

const EmptyPage = ({ name }) => <h2>{name} Page</h2>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
        <Routes>
          <Route path="/search" element={<Search name="Search" />} />
          <Route path="/messages" element={<Messages name="Messages" />} />
          <Route path="/random" element={<Random name="Random" />} />
          <Route path="/profile" element={<Profile name="Profile" />} />
          <Route path="/notifications" element={<Notification name="Notifications" />} />
        </Routes>
        <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footbar />
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
