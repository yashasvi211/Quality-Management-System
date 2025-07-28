import React, { useState, useEffect } from 'react';
import { ClipboardCheck, ShieldAlert, UserCheck, Calendar, Flag, Info, SearchCheck, Link as LinkIcon, Sparkles, FileText, Target, Building2, Users2, ShieldCheck as PlanIcon, ListChecks } from 'lucide-react';

const TABS = ['Details', 'Audit Plan', 'Findings & CAPAs', 'AI Insights'];

const getRiskBadgeClass = (risk) => risk === 'High' ? 'badge-red' : risk === 'Medium' ? 'badge-yellow' : 'badge-gray';
const getStatusBadgeClass = (status) => status === 'Planned' ? 'badge-blue' : status === 'In Progress' ? 'badge-yellow' : 'badge-green';

function AuditDetail({ eventId }) {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://localhost:8000/audit/${eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch audit details');
        }
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div className="detail-page-container">
      <div className="header-card">
        <div className="header-top-row">
          <h1><ClipboardCheck size={24} /> {event.id}: {event.title}</h1>
        </div>
        <div className="header-meta">
          <span className="meta-item"><Flag size={14} /><strong>Type:</strong>&nbsp;{event.type}</span>
          <span className="meta-item"><ShieldAlert size={14} /><strong>Risk:</strong>&nbsp;<span className={`status-badge ${getRiskBadgeClass(event.risk)}`}>{event.risk}</span></span>
          <span className="meta-item"><Flag size={14} /><strong>Status:</strong>&nbsp;<span className={`status-badge ${getStatusBadgeClass(event.status)}`}>{event.status}</span></span>
          <span className="meta-item"><UserCheck size={14} /><strong>Lead Auditor:</strong>&nbsp;{event.leadAuditor}</span>
          <span className="meta-item"><Calendar size={14} /><strong>Date:</strong>&nbsp;{new Date(event.date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="tabs-container">
        {TABS.map(tab => (
          <button key={tab} className={`tab-button ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'Details' && <Info size={14} />}
            {tab === 'Audit Plan' && <PlanIcon size={14} />}
            {tab === 'Findings & CAPAs' && <SearchCheck size={14} />}
            {tab === 'AI Insights' && <Sparkles size={14} />}
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'Details' && (
          <div className="details-grid">
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
                <dt>Name</dt><dd>{event.auditeeName}</dd>
                <dt>Location</dt><dd>{event.siteLocation}</dd>
                <dt>Contact</dt><dd>{event.primaryContact}</dd>
              </dl>
            </div>
            <div className="detail-section">
              <h3 className="section-header"><Users2 size={16}/>Audit Team</h3>
              <dl className="fields-list">
                <dt>Lead Auditor</dt><dd>{event.leadAuditor}</dd>
                <dt>Team Members</dt><dd>{event.members}</dd>
              </dl>
            </div>
          </div>
        )}
         {activeTab === 'Audit Plan' && (
          <div className="details-grid">
            <div className="detail-section">
              <h3 className="section-header"><PlanIcon size={16}/>Audit Criteria</h3>
              <p className="pre-wrap">{event.criteria}</p>
            </div>
            <div className="detail-section">
              <h3 className="section-header"><ListChecks size={16}/>Audit Agenda</h3>
              <p className="pre-wrap">{event.agenda}</p>
            </div>
          </div>
        )}
        {activeTab === 'Findings & CAPAs' && <div className="placeholder-content">Findings and linked CAPAs would be listed here.</div>}
        {activeTab === 'AI Insights' && <div className="placeholder-content">AI-generated insights for this audit would be displayed here.</div>}
      </div>
    </div>
  );
}

export default AuditDetail;
