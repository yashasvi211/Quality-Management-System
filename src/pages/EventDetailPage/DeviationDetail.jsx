import React, { useState, useEffect } from 'react';
import { FileWarning, ShieldAlert, UserCheck, Calendar, Flag, Sparkles, FileText } from 'lucide-react';
import './EventDetailPage.css';

const getRiskBadgeClass = (risk) => risk === 'High' ? 'badge-red' : risk === 'Medium' ? 'badge-yellow' : 'badge-gray';
const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'Planned': return 'status-planned';
        case 'In Progress': return 'status-in-progress';
        case 'Completed': return 'status-completed';
        case 'Cancelled': return 'status-cancelled';
        default: return 'status-default';
    }
};

const STATUS_OPTIONS = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

function DeviationDetail({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/deviation/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch Deviation details');
        const data = await response.json();
        setEvent(data);
        setCurrentStatus(data.status);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (event) {
      const fetchSummary = async () => {
        setLoadingSummary(true);
        try {
          const response = await fetch(`http://localhost:8001/event/deviation/${eventId}/summary`);
          if (!response.ok) throw new Error('Failed to fetch AI summary');
          const data = await response.json();
          setAiSummary(data.summary);
        } catch (err) {
          setAiSummary('Could not generate AI summary at this time.');
        } finally {
          setLoadingSummary(false);
        }
      };
      fetchSummary();
    }
  }, [event, eventId]);

  const handleStatusChange = async (newStatus) => {
    setCurrentStatus(newStatus);
    try {
        const response = await fetch(`http://localhost:8000/event/deviation/${eventId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            setCurrentStatus(event.status);
            throw new Error('Failed to update status.');
        }
    } catch (err) {
        console.error("Status update error:", err);
    }
  };

  if (loading) return <div className="detail-page-container"><p>Loading Deviation details...</p></div>;
  if (error) return <div className="detail-page-container"><p>Error: {error}</p></div>;
  if (!event) return <div className="detail-page-container"><p>Deviation not found.</p></div>;

  return (
    <div className="detail-page-container">
      <div className="header-card">
        <div className="header-top-row">
          <h1><FileWarning size={24} /> DEV-{event.id}: {event.title}</h1>
          <div className="status-selector-wrapper">
            <select value={currentStatus} onChange={(e) => handleStatusChange(e.target.value)} className={`status-selector ${getStatusBadgeClass(currentStatus)}`}>
              {STATUS_OPTIONS.map(option => (<option key={option} value={option}>{option}</option>))}
            </select>
          </div>
        </div>
        <div className="header-meta">
          <span className="meta-item"><Flag size={14} /><strong>Type:</strong>&nbsp;Deviation</span>
          <span className="meta-item"><ShieldAlert size={14} /><strong>Risk:</strong>&nbsp;<span className={`status-badge ${getRiskBadgeClass(event.risk)}`}>{event.risk}</span></span>
          <span className="meta-item"><UserCheck size={14} /><strong>Owner:</strong>&nbsp;{event.owner_name}</span>
          <span className="meta-item"><Calendar size={14} /><strong>Occurred:</strong>&nbsp;{new Date(event.date_occurred).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="details-grid">
        <div className="detail-section full-span">
            <h3 className="section-header"><Sparkles size={16}/>AI Summary</h3>
            <p>{loadingSummary ? 'Generating summary...' : aiSummary}</p>
        </div>
        <div className="detail-section full-span">
            <h3 className="section-header"><FileText size={16}/>Description</h3>
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
        <div className="detail-section">
            <h3 className="section-header">Reported By</h3>
            <p>{event.reported_by}</p>
        </div>
      </div>
    </div>
  );
}

export default DeviationDetail;