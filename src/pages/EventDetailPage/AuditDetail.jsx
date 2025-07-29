import React, { useState, useEffect } from 'react';
import { ClipboardCheck, ShieldAlert, UserCheck, Calendar, Flag, Target, Building2, Users2, ShieldCheck as PlanIcon, ListChecks, Sparkles } from 'lucide-react';
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

function AuditDetail({ eventId }) {
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
        const response = await fetch(`http://localhost:8000/audit/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch audit details');
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
          const response = await fetch(`http://localhost:8001/event/audit/${eventId}/summary`);
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
        const response = await fetch(`http://localhost:8000/event/audit/${eventId}/status`, {
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

  if (loading) return <div className="detail-page-container"><p>Loading audit details...</p></div>;
  if (error) return <div className="detail-page-container"><p>Error: {error}</p></div>;
  if (!event) return <div className="detail-page-container"><p>Audit not found.</p></div>;

  return (
    <div className="detail-page-container">
      <div className="header-card">
        <div className="header-top-row">
          <h1><ClipboardCheck size={24} /> AUD-{event.id}: {event.title}</h1>
          <div className="status-selector-wrapper">
            <select value={currentStatus} onChange={(e) => handleStatusChange(e.target.value)} className={`status-selector ${getStatusBadgeClass(currentStatus)}`}>
              {STATUS_OPTIONS.map(option => (<option key={option} value={option}>{option}</option>))}
            </select>
          </div>
        </div>
        <div className="header-meta">
          <span className="meta-item"><Flag size={14} /><strong>Type:</strong>&nbsp;{event.type}</span>
          <span className="meta-item"><ShieldAlert size={14} /><strong>Risk:</strong>&nbsp;<span className={`status-badge ${getRiskBadgeClass(event.risk)}`}>{event.risk}</span></span>
          <span className="meta-item"><UserCheck size={14} /><strong>Lead Auditor:</strong>&nbsp;{event.lead_auditor}</span>
          <span className="meta-item"><Calendar size={14} /><strong>Date:</strong>&nbsp;{new Date(event.audit_date).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="details-grid">
        <div className="detail-section full-span">
            <h3 className="section-header"><Sparkles size={16}/>AI Summary</h3>
            <p>{loadingSummary ? 'Generating summary...' : aiSummary}</p>
        </div>
        <div className="detail-section full-span">
          <h3 className="section-header"><Target size={16}/>Scope and Objective</h3>
          <dl className="fields-list">
            <dt>Scope</dt><dd>{event.scope}</dd>
            <dt>Objective</dt><dd>{event.objective}</dd>
          </dl>
        </div>
        <div className="detail-section">
          <h3 className="section-header"><Building2 size={16}/>Auditee</h3>
          <dl className="fields-list">
            <dt>Name</dt><dd>{event.auditee_name}</dd>
            <dt>Location</dt><dd>{event.site_location}, {event.country}</dd>
            <dt>Primary Contact</dt><dd>{event.primary_contact}</dd>
             <dt>Contact Email</dt><dd>{event.contact_email}</dd>
          </dl>
        </div>
        <div className="detail-section">
          <h3 className="section-header"><Users2 size={16}/>Audit Team</h3>
          <dl className="fields-list">
            <dt>Lead Auditor</dt><dd>{event.lead_auditor}</dd>
            <dt>Team Members</dt><dd>{event.members}</dd>
          </dl>
        </div>
         <div className="detail-section">
          <h3 className="section-header"><PlanIcon size={16}/>Audit Criteria</h3>
          <p className="pre-wrap">{event.criteria}</p>
        </div>
        <div className="detail-section">
          <h3 className="section-header"><ListChecks size={16}/>Audit Agenda</h3>
          <p className="pre-wrap">{event.agenda}</p>
        </div>
      </div>
    </div>
  );
}

export default AuditDetail;
