import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import EventListPage from './pages/EventListPage/EventListPage';
import CreateAuditPage from './pages/CreateAuditPage/CreateAuditPage'; // New Audit Wizard
import EventDetailPage from './pages/EventDetailPage/EventDetailPage'; // This will be the router component
import AIAssistant from './components/AIAssistant';
import './App.css';
import CreateEventPage from './pages/CreateEventPage/CreateEventPage';
import CreateDeviationPage from './pages/CreateDeviationPage/CreateDeviationPage';
import CreateChangeControlPage from './pages/CreateChangeControlPage/CreateChangeControlPage';
import CreateCAPAPage from './pages/CreateCAPAPage/CreateCAPAPage';

function App() {
  const location = useLocation();
  // Show AI assistant on list and detail pages
  const showAIAssistant = location.pathname === '/' || location.pathname.startsWith('/event/');

  return (
    <div className="app-layout">
      <Header />
      <div className="content-wrapper">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<EventListPage />} />
            <Route path="/create-audit" element={<CreateAuditPage />} />
            <Route path="/create-deviation" element={<CreateDeviationPage />} />
            <Route path="/create-change-control" element={<CreateChangeControlPage />} />
            <Route path="/create-capa" element={<CreateCAPAPage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/event/:eventId" element={<EventDetailPage />} />
          </Routes>
        </main>
        {showAIAssistant && <AIAssistant />}
      </div>
    </div>
  );
}

export default App;
