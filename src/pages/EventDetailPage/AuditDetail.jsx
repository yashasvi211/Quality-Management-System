import React, { useState, useEffect } from 'react';
import { ClipboardCheck, ShieldAlert, UserCheck, Calendar, Flag, Target, Building2, Users2, ShieldCheck as PlanIcon, ListChecks, Sparkles, SearchCheck } from 'lucide-react';

// Helper functions for badge styling
const getRiskBadgeClass = (risk) => risk === 'High' ? 'badge-red' : risk === 'Medium' ? 'badge-yellow' : 'badge-gray';
const getStatusBadgeClass = (status) => status === 'Planned' ? 'badge-blue' : status === 'In Progress' ? 'badge-yellow' : 'badge-green';

function AuditDetail({ eventId }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/audit/${eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch audit details');
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

  if (loading) return <div className="detail-page-container"><p>Loading audit details...</p></div>;
  if (error) return <div className="detail-page-container"><p>Error: {error}</p></div>;
  if (!event) return <div className="detail-page-container"><p>Audit not found.</p></div>;

  return (
    <div className="detail-page-container">
      {/* Header Card */}
      <div className="header-card">
        <div className="header-top-row">
          <h1><ClipboardCheck size={24} /> AUD-{event.id}: {event.title}</h1>
        </div>
        <div className="header-meta">
          <span className="meta-item"><Flag size={14} /><strong>Type:</strong>&nbsp;{event.type}</span>
          <span className="meta-item"><ShieldAlert size={14} /><strong>Risk:</strong>&nbsp;<span className={`status-badge ${getRiskBadgeClass(event.risk)}`}>{event.risk}</span></span>
          <span className="meta-item"><Flag size={14} /><strong>Status:</strong>&nbsp;Planned</span>
          <span className="meta-item"><UserCheck size={14} /><strong>Lead Auditor:</strong>&nbsp;{event.lead_auditor}</span>
          <span className="meta-item"><Calendar size={14} /><strong>Date:</strong>&nbsp;{new Date(event.audit_date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="details-grid">
        {/* Scope and Objective Section */}
        <div className="detail-section full-span">
          <h3 className="section-header"><Target size={16}/>Scope and Objective</h3>
          <dl className="fields-list">
            <dt>Scope</dt><dd>{event.scope}</dd>
            <dt>Objective</dt><dd>{event.objective}</dd>
          </dl>
        </div>

        {/* Auditee Section */}
        <div className="detail-section">
          <h3 className="section-header"><Building2 size={16}/>Auditee</h3>
          <dl className="fields-list">
            <dt>Name</dt><dd>{event.auditee_name}</dd>
            <dt>Location</dt><dd>{event.site_location}</dd>
            <dt>Contact</dt><dd>{event.primary_contact}</dd>
          </dl>
        </div>

        {/* Audit Team Section */}
        <div className="detail-section">
          <h3 className="section-header"><Users2 size={16}/>Audit Team</h3>
          <dl className="fields-list">
            <dt>Lead Auditor</dt><dd>{event.lead_auditor}</dd>
            <dt>Team Members</dt><dd>{event.members}</dd>
          </dl>
        </div>

        {/* Audit Plan Section */}
        <div className="detail-section">
          <h3 className="section-header"><PlanIcon size={16}/>Audit Criteria</h3>
          <p className="pre-wrap">{event.criteria}</p>
        </div>
        <div className="detail-section">
          <h3 className="section-header"><ListChecks size={16}/>Audit Agenda</h3>
          <p className="pre-wrap">{event.agenda}</p>
        </div>

        {/* Findings & CAPAs Section
        <div className="detail-section full-span">
            <h3 className="section-header"><SearchCheck size={16}/>Findings & CAPAs</h3>
            <div className="placeholder-content">Findings and linked CAPAs would be listed here.</div>
        </div> */}

        {/* AI Insights Section */}
        <div className="detail-section full-span">
            <h3 className="section-header"><Sparkles size={16}/>AI Insights</h3>
            <div className="placeholder-content">AI-generated insights for this audit would be displayed here.</div>
        </div>

         
      </div>
    </div>
  );
}

export default AuditDetail;
