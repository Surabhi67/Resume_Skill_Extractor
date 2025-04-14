import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SubmitResume from './components/SubmitResume';
import ViewTable from './components/ViewTable';
import Login from './components/login';
import Signup from './components/signup';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Simple redirect without useNavigate
  };

  return (
    <Router>
      <div className="App">
        <div className="app-container" style={{
          display: 'flex',
          minHeight: '100vh'
        }}>
          <nav style={sidebarStyle(isCollapsed)}>
            <div className="sidebar-header" style={sidebarHeaderStyle}>
              <button 
                onClick={toggleSidebar}
                style={sidebarToggleButtonStyle}
                aria-label="Toggle sidebar"
              >
                ☰
              </button>
              <Link to="/" style={logoStyle}>
                <h2 style={logoTextStyle}>Resume Extractor</h2>
              </Link>
            </div>

            <div className="sidebar-links">
              <Link to="/" style={navLinkStyle}>Submit Resume</Link>
              <Link to="/view-table" style={navLinkStyle}>View Resumes</Link>
              <Link to="/login" style={navLinkStyle}>Login</Link>
              <Link to="/signup" style={navLinkStyle}>Signup</Link>
              <button onClick={handleLogout} style={navLinkStyle}>Logout</button>
            </div>
          </nav>

          <main style={{ flex: 1, padding: '20px', backgroundColor: '#f4f4f9' }}>
            <Routes>
              <Route path="/" element={<SubmitResume />} />
              <Route path="/view-table" element={<ViewTable />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

// Styles
const sidebarStyle = (isCollapsed) => ({
  width: isCollapsed ? '60px' : '250px',
  backgroundColor: '#34495e',
  padding: '20px 10px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'width 0.3s ease-in-out',
  minHeight: '100vh',
});

const sidebarHeaderStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '30px',
};

const sidebarToggleButtonStyle = {
  background: 'none',
  border: 'none',
  color: '#fff',
  fontSize: '24px',
  cursor: 'pointer',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: '#fff',
};

const logoTextStyle = {
  marginLeft: '10px',
  fontSize: '24px',
  fontWeight: 'bold',
};

const navLinkStyle = {
  color: '#fff',
  textDecoration: 'none',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '4px',
  transition: 'background 0.3s',
  whiteSpace: 'nowrap',
  display: 'flex',
  alignItems: 'center',
  fontSize: '16px',
};

export default App;
