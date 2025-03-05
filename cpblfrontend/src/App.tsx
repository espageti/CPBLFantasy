import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TeamsList from "./components/TeamsList";
import TeamDetail from "./components/TeamDetail";
import LeagueList from "./components/LeagueList";
import LeagueDetail from "./components/LeagueDetail";
import HomePage from "./components/HomePage";
import PlayerStats from "./components/PlayerStats";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/leagues" element={<LeagueList />} />
        <Route path="/leagues/:leagueId" element={<LeagueDetail />} />
        <Route path="/teams" element={<TeamsList />} />
        <Route path="/teams/:teamId" element={<TeamDetail />} />
        <Route path="/player-stats" element={<PlayerStats />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;