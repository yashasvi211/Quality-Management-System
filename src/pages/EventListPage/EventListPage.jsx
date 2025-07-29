import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import './EventListPage.css';

// Helper function to determine the CSS class for the status badge
const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'Planned': return 'status-planned';
        case 'In Progress': return 'status-in-progress';
        case 'Closed': return 'status-closed';
        case 'Cancelled': return 'status-cancelled';
        default: return 'status-default';
    }
};

// Helper function to get the correct prefix for the event type
const getEventTypePrefix = (eventType) => {
    switch (eventType) {
        case 'Audit':
            return 'AUD';
        case 'Change Control':
            return 'CHC';
        case 'CAPA':
            return 'CPA';
        case 'Deviation':
            return 'DEV';
        default:
            // Fallback for any other types
            return eventType.substring(0, 3).toUpperCase();
    }
};

function EventListPage() {
  // State for storing events, loading status, and errors
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const [filtersVisible, setFiltersVisible] = useState(false);

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch events:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); // The empty dependency array ensures this runs only once on mount

  // Handle row click to navigate to a detail page
  const handleRowClick = (eventType, eventId) => {
    if (!eventType || !eventId) return;
    // Create a URL-friendly path (e.g., "Change Control" becomes "change-control")
    const path = eventType.toLowerCase().replace(/\s+/g, '-');
    navigate(`/event/${path}/${eventId}`);
  };

  // Render loading state
  if (loading) {
    return <div className="list-page-container"><p>Loading events...</p></div>;
  }

  // Render error state
  if (error) {
    return <div className="list-page-container"><p>Error fetching data: {error}</p></div>;
  }

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
          {/* Filter inputs can be implemented here */}
          <p>Filter controls will go here.</p>
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
                <th>Author</th>
                <th>Due/End Date</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={`${event.type}-${event.id}`} onClick={() => handleRowClick(event.type, event.id)} className="clickable-row">
                    <td className="linkable">{`${getEventTypePrefix(event.type)}-${event.id}`}</td>
                    <td className="wrap-text">{event.title}</td>
                    <td>{event.type}</td>
                    <td><span className={`status-badge ${getStatusBadgeClass(event.status)}`}>{event.status}</span></td>
                    <td>{event.owner || 'N/A'}</td>
                    <td>{event.due_date ? new Date(event.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td>{event.risk || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EventListPage;
