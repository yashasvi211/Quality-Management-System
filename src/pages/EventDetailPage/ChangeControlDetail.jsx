import React, { useState, useEffect } from 'react';
import { GitBranchPlus, ShieldAlert, UserCheck, Flag, FileText, AlertCircle, Layers, ListChecks, Sparkles } from 'lucide-react';

// Helper functions for badge styling
const getRiskBadgeClass = (risk) => risk === 'High' ? 'badge-red' : risk === 'Medium' ? 'badge-yellow' : 'badge-gray';
const getStatusBadgeClass = (status) => status === 'In Progress' ? 'badge-yellow' : 'badge-green';

function ChangeControlDetail({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/change_control/${eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch Change Control details');
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

  if (loading) return <div className="detail-page-container"><p>Loading Change Control details...</p></div>;
  if (error) return <div className="detail-page-container"><p>Error: {error}</p></div>;
  if (!event) return <div className="detail-page-container"><p>Change Control not found.</p></div>;

  return (
    <div className="detail-page-container">
      <div className="header-card">
        <div className="header-top-row">
          <h1><GitBranchPlus size={24} /> CHC-{event.id}: {event.title}</h1>
        </div>
        <div className="header-meta">
          <span className="meta-item"><Flag size={14} /><strong>Type:</strong>&nbsp;Change Control</span>
          <span className="meta-item"><ShieldAlert size={14} /><strong>Risk:</strong>&nbsp;<span className={`status-badge ${getRiskBadgeClass(event.risk)}`}>{event.risk}</span></span>
          <span className="meta-item"><Flag size={14} /><strong>Status:</strong>&nbsp;<span className={`status-badge ${getStatusBadgeClass(event.status)}`}>{event.status}</span></span>
          <span className="meta-item"><UserCheck size={14} /><strong>Owner:</strong>&nbsp;{event.owner_name}</span>
          <span className="meta-item"><UserCheck size={14} /><strong>Requested By:</strong>&nbsp;{event.requested_by}</span>
        </div>
      </div>
      
      <div className="details-grid">
        <div className="detail-section full-span">
            <h3 className="section-header"><FileText size={16}/>Change Description</h3>
            <p>{event.change_description}</p>
        </div>
        <div className="detail-section">
            <h3 className="section-header"><AlertCircle size={16}/>Reason for Change</h3>
            <p>{event.reason_for_change}</p>
        </div>
        <div className="detail-section">
            <h3 className="section-header"><Layers size={16}/>Affected Areas</h3>
            <p>{event.affected_areas}</p>
        </div>
        <div className="detail-section full-span">
            <h3 className="section-header"><ListChecks size={16}/>Implementation Plan</h3>
            <p className="pre-wrap">{event.implementation_plan}</p>
        </div>
        {/* AI Assistance Section */}
        <div className="detail-section full-span">
            <h3 className="section-header"><Sparkles size={16}/>AI Assistance</h3>
            <div className="placeholder-content">AI assistance for this Change Control would be displayed here.</div>
        </div>
      </div>
    </div>
  );
}

export default ChangeControlDetail;
