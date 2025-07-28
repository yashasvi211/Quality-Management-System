import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAllEvents } from '../../redux/features/eventsSlice';
import { Filter, PlusCircle } from 'lucide-react';
import './EventListPage.css';

const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'Planned': return 'status-planned';
        case 'Investigation':
        case 'In Progress': return 'status-in-progress';
        case 'Closed': return 'status-closed';
        case 'Cancelled': return 'status-cancelled';
        default: return 'status-default';
    }
};

function EventListPage() {
  const events = useSelector(selectAllEvents);
  const navigate = useNavigate();
  const [filtersVisible, setFiltersVisible] = useState(false);

  return (
    <div className="list-page-container">
      <div className="view-header">
        <h1 className="view-title">QMS Dashboard</h1>
        <div className="view-actions">
          <button className="action-button secondary" onClick={() => setFiltersVisible(!filtersVisible)}>
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {filtersVisible && (
        <div className="filter-panel">
          <div className="filter-grid">
            <div><label htmlFor="filter-id">Event ID</label><input type="text" id="filter-id" /></div>
            <div><label htmlFor="filter-type">Type</label><select id="filter-type"><option>All</option><option>Deviation</option><option>CAPA</option><option>Audit</option></select></div>
            <div><label htmlFor="filter-status">Status</label><select id="filter-status"><option>All</option><option>Planned</option><option>Investigation</option><option>In Progress</option><option>Closed</option></select></div>
            <div><label htmlFor="filter-owner">Owner</label><input type="text" id="filter-owner" /></div>
            <div><label htmlFor="filter-department">Department</label><input type="text" id="filter-department" /></div>
          </div>
        </div>
      )}

      <div className="content-card">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Due/End Date</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} onClick={() => navigate(`/event/${event.id}`)} className="clickable-row">
                  <td className="linkable">{event.id}</td>
                  <td className="wrap-text">{event.title}</td>
                  <td>{event.type}</td>
                  <td><span className={`status-badge ${getStatusBadgeClass(event.status)}`}>{event.status}</span></td>
                  <td>{event.owner}</td>
                  <td>{new Date(event.schedule?.confirmedEndDate || event.dueDate).toLocaleDateString()}</td>
                  <td>{event.risk || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EventListPage;
