import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import TeamsList from "./components/TeamsList";
import TeamDetail from "./components/TeamDetail";
import LeagueList from "./components/LeagueList";
import LeagueDetail from "./components/LeagueDetail";
import HomePage from "./components/HomePage";
import PlayerStats from "./components/PlayerStats";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
// import Dashboard from './components/Dashboard';
// import Profile from './components/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<HomePage />} />
          
          {/* Protected routes that require authentication */}
          {/* <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } /> */}
          <Route path="/leagues" element={<LeagueList />} />
          <Route path="/leagues/:leagueId" element={<LeagueDetail />} />
          <Route path="/teams" element={<TeamsList />} />
          <Route path="/teams/:teamId" element={<TeamDetail />} />
          <Route path="/player-stats" element={<PlayerStats />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;