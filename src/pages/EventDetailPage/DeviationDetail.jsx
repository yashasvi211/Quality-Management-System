import React from 'react';
import { FileWarning, ShieldAlert, UserCheck, Calendar, Flag, Package } from 'lucide-react';

const getRiskBadgeClass = (risk) => risk === 'High' ? 'badge-red' : risk === 'Medium' ? 'badge-yellow' : 'badge-gray';
const getStatusBadgeClass = (status) => status === 'Investigation' ? 'badge-yellow' : 'badge-green';

// This is the refactored detail page specifically for Deviations/CAPAs
function DeviationDetail({ event }) {
  return (
    <div className="detail-page-container">
      <div className="header-card">
        <div className="header-top-row">
          <h1><FileWarning size={24} /> {event.id}: {event.title}</h1>
        </div>
        <div className="header-meta">
          <span className="meta-item"><Flag size={14} /><strong>Type:</strong>&nbsp;{event.type}</span>
          <span className="meta-item"><ShieldAlert size={14} /><strong>Risk:</strong>&nbsp;<span className={`status-badge ${getRiskBadgeClass(event.risk)}`}>{event.risk}</span></span>
          <span className="meta-item"><Flag size={14} /><strong>Status:</strong>&nbsp;<span className={`status-badge ${getStatusBadgeClass(event.status)}`}>{event.status}</span></span>
          <span className="meta-item"><UserCheck size={14} /><strong>Owner:</strong>&nbsp;{event.owner}</span>
          <span className="meta-item"><Calendar size={14} /><strong>Due:</strong>&nbsp;{new Date(event.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="details-grid">
        <div className="detail-section full-span">
            <h3 className="section-header">Description</h3>
            <p>{event.description}</p>
        </div>
        <div className="detail-section">
            <h3 className="section-header">Investigation</h3>
            <dl className="fields-list">
                <dt>Root Cause</dt><dd>{event.investigation?.rootCause || 'TBD'}</dd>
            </dl>
        </div>
        <div className="detail-section">
            <h3 className="section-header"><Package size={16}/>Affected Product</h3>
            <dl className="fields-list">
                <dt>Name</dt><dd>{event.affectedProduct?.name || 'N/A'}</dd>
                <dt>Batch</dt><dd>{event.affectedProduct?.batchNumber || 'N/A'}</dd>
            </dl>
        </div>
      </div>
    </div>
  );
}

export default DeviationDetail;
