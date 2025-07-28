import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, UserCheck, Calendar, Flag, FileText, AlertTriangle, ListChecks, Sparkles } from 'lucide-react';

// Helper functions for badge styling
const getRiskBadgeClass = (risk) => risk === 'High' ? 'badge-red' : risk === 'Medium' ? 'badge-yellow' : 'badge-gray';
const getStatusBadgeClass = (status) => status === 'In Progress' ? 'badge-yellow' : 'badge-green';

function CapaDetail({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/capa/${eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch CAPA details');
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

  if (loading) return <div className="detail-page-container"><p>Loading CAPA details...</p></div>;
  if (error) return <div className="detail-page-container"><p>Error: {error}</p></div>;
  if (!event) return <div className="detail-page-container"><p>CAPA not found.</p></div>;

  return (
    <div className="detail-page-container">
      <div className="header-card">
        <div className="header-top-row">
          <h1><ShieldCheck size={24} /> CPA-{event.id}: {event.title}</h1>
        </div>
        <div className="header-meta">
          <span className="meta-item"><Flag size={14} /><strong>Type:</strong>&nbsp;CAPA</span>
          <span className="meta-item"><ShieldAlert size={14} /><strong>Risk:</strong>&nbsp;<span className={`status-badge ${getRiskBadgeClass(event.risk)}`}>{event.risk}</span></span>
          <span className="meta-item"><Flag size={14} /><strong>Status:</strong>&nbsp;<span className={`status-badge ${getStatusBadgeClass(event.status)}`}>{event.status}</span></span>
          <span className="meta-item"><UserCheck size={14} /><strong>Owner:</strong>&nbsp;{event.owner_name}</span>
          <span className="meta-item"><Calendar size={14} /><strong>Due:</strong>&nbsp;{new Date(event.due_date).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="details-grid">
        <div className="detail-section full-span">
            <h3 className="section-header"><FileText size={16}/>Issue Description</h3>
            <p>{event.issue_description}</p>
        </div>
        <div className="detail-section">
            <h3 className="section-header"><AlertTriangle size={16}/>Root Cause Analysis</h3>
            <p>{event.root_cause}</p>
        </div>
        <div className="detail-section">
            <h3 className="section-header"><UserCheck size={16}/>Responsible Person</h3>
            <p>{event.responsible_person}</p>
        </div>
        <div className="detail-section">
            <h3 className="section-header"><ListChecks size={16}/>Corrective Actions</h3>
            <p className="pre-wrap">{event.corrective_actions}</p>
        </div>
        <div className="detail-section">
            <h3 className="section-header"><ListChecks size={16}/>Preventive Actions</h3>
            <p className="pre-wrap">{event.preventive_actions}</p>
        </div>
        {/* AI Assistance Section */}
        <div className="detail-section full-span">
            <h3 className="section-header"><Sparkles size={16}/>AI Assistance</h3>
            <div className="placeholder-content">AI assistance for this CAPA would be displayed here.</div>
        </div>
      </div>
    </div>
  );
}

export default CapaDetail;
