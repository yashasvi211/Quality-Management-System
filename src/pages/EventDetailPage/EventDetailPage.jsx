import React from 'react';
import { useParams, Link } from 'react-router-dom';
import AuditDetail from './AuditDetail';
import DeviationDetail from './DeviationDetail';
import CapaDetail from './CapaDetail';
import ChangeControlDetail from './ChangeControlDetail';
import './EventDetailPage.css';

// This component now acts as a router to display the correct detail page
// based on the event type from the URL.

function EventDetailPage() {
  // Get eventType (e.g., 'audit', 'capa') and eventId from the URL
  const { eventType, eventId } = useParams();

  // Render the appropriate detail component based on the eventType parameter
  switch (eventType) {
    case 'audit':
      return <AuditDetail eventId={eventId} />;
    case 'deviation':
      return <DeviationDetail eventId={eventId} />;
    case 'capa':
      return <CapaDetail eventId={eventId} />;
    case 'change-control':
      return <ChangeControlDetail eventId={eventId} />;
    default:
      // Fallback for an unknown event type
      return (
        <div className="detail-page-container">
          <h2>Unknown Event Type</h2>
          <p>The event type "{eventType}" is not recognized.</p>
          <Link to="/" className="back-link">
            &larr; Back to Dashboard
          </Link>
        </div>
      );
  }
}

export default EventDetailPage;
