import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
      <div className="app">
        <Routes>
          <Route path="/search" element={<Search name="Search" />} />
          <Route path="/messages" element={<Messages name="Messages" />} />
          <Route path="/random" element={<Random name="Random" />} />
          <Route path="/profile" element={<Profile name="Profile" />} />
          <Route path="/notifications" element={<Notification name="Notifications" />} />
        </Routes>
        <Footbar />
      </div>
    </Router>
  );
}

export default App;
