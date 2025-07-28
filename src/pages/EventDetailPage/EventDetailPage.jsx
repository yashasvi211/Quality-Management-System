import React from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { selectEventById } from '../../redux/features/eventsSlice';
import AuditDetail from './AuditDetail';
import DeviationDetail from './DeviationDetail';
import './EventDetailPage.css';

// This component now acts as a router to display the correct detail page
// based on the event type.

function EventDetailPage() {
  const { eventId } = useParams();
  const event = useSelector((state) => selectEventById(state, eventId));

  if (!event) {
    return (
      <div className="detail-page-container">
        <h2>Event Not Found</h2>
        <p>The event with ID "{eventId}" could not be found.</p>
        <Link to="/" className="back-link">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  // Render the appropriate detail component based on event type
  switch (event.type) {
    case 'Audit':
      return <AuditDetail event={event} />;
    case 'Deviation':
    case 'CAPA': // Can add a specific CAPADetail component later
    default:
      return <DeviationDetail event={event} />;
  }
}

export default EventDetailPage;
