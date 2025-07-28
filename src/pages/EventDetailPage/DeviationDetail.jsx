import React, { useState, useEffect } from 'react';
import { FileWarning, ShieldAlert, UserCheck, Calendar, Flag, Sparkles } from 'lucide-react';

const getRiskBadgeClass = (risk) => risk === 'High' ? 'badge-red' : risk === 'Medium' ? 'badge-yellow' : 'badge-gray';
const getStatusBadgeClass = (status) => status === 'In Progress' ? 'badge-yellow' : 'badge-green';

function DeviationDetail({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/deviation/${eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch Deviation details');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) return <div className="detail-page-container"><p>Loading Deviation details...</p></div>;
  if (error) return <div className="detail-page-container"><p>Error: {error}</p></div>;
  if (!event) return <div className="detail-page-container"><p>Deviation not found.</p></div>;

  return (
    <div className="detail-page-container">
      <div className="header-card">
        <div className="header-top-row">
          <h1><FileWarning size={24} /> DEV-{event.id}: {event.title}</h1>
        </div>
        <div className="header-meta">
          <span className="meta-item"><Flag size={14} /><strong>Type:</strong>&nbsp;Deviation</span>
          <span className="meta-item"><ShieldAlert size={14} /><strong>Risk:</strong>&nbsp;<span className={`status-badge ${getRiskBadgeClass(event.risk)}`}>{event.risk}</span></span>
          <span className="meta-item"><Flag size={14} /><strong>Status:</strong>&nbsp;<span className={`status-badge ${getStatusBadgeClass(event.status)}`}>{event.status}</span></span>
          <span className="meta-item"><UserCheck size={14} /><strong>Owner:</strong>&nbsp;{event.owner_name}</span>
          <span className="meta-item"><Calendar size={14} /><strong>Occurred:</strong>&nbsp;{new Date(event.date_occurred).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="details-grid">
        <div className="detail-section full-span">
            <h3 className="section-header">Description</h3>
            <p>{event.description}</p>
        </div>
        <div className="detail-section">
            <h3 className="section-header">Impact</h3>
            <p>{event.impact}</p>
        </div>
        <div className="detail-section">
            <h3 className="section-header">Corrective Actions</h3>
            <p>{event.corrective_actions}</p>
        </div>
        {/* AI Assistance Section */}
        <div className="detail-section full-span">
            <h3 className="section-header"><Sparkles size={16}/>AI Assistance</h3>
            <div className="placeholder-content">AI assistance for this Deviation would be displayed here.</div>
        </div>
      </div>
    </div>
  );
}

export default DeviationDetail;
