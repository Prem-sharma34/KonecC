import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footbar from "./components/footbar.jsx";

const EmptyPage = ({ name }) => <h2>{name} Page</h2>;

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/search" element={<EmptyPage name="Search" />} />
          <Route path="/messages" element={<EmptyPage name="Messages" />} />
          <Route path="/random" element={<EmptyPage name="Random" />} />
          <Route path="/profile" element={<EmptyPage name="Profile" />} />
          <Route path="/notifications" element={<EmptyPage name="Notifications" />} />
        </Routes>
        <Footbar />
      </div>
    </Router>
  );
}

export default App;
