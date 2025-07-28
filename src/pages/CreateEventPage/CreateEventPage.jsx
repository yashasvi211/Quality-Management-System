import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { addEvent } from '../../redux/features/eventsSlice';
import { ArrowLeft, ArrowRight, Save, Check, FileCheck2 } from 'lucide-react';
import './CreateEventPage.css';

// Define steps for each event type
const EVENT_STEPS = {
  Deviation: [
    { id: 1, title: 'Initialization', description: 'Type & Initial Details' },
    { id: 2, title: 'Impact Assessment', description: 'Product & Quality Impact' },
    { id: 3, title: 'Investigation', description: 'Root Cause Analysis' },
    { id: 4, title: 'Actions', description: 'Immediate & Corrective Actions' },
    { id: 5, title: 'Review', description: 'Final Review & Approval' },
  ],
  CAPA: [
    { id: 1, title: 'Problem Definition', description: 'Issue & Scope' },
    { id: 2, title: 'Root Cause', description: 'Analysis & Investigation' },
    { id: 3, title: 'Corrective Action', description: 'Immediate Fix' },
    { id: 4, title: 'Preventive Action', description: 'Long-term Prevention' },
    { id: 5, title: 'Effectiveness Check', description: 'Verification & Close' },
  ],
  'Change Control': [
    { id: 1, title: 'Change Request', description: 'Proposed Change' },
    { id: 2, title: 'Impact Analysis', description: 'Risk Assessment' },
    { id: 3, title: 'Planning', description: 'Implementation Plan' },
    { id: 4, title: 'Approval', description: 'Review & Approval' },
    { id: 5, title: 'Implementation', description: 'Execute & Verify' },
  ],
};

const getInitialFormData = (eventType) => ({
  type: eventType,
  title: '',
  scope: '',
  objective: '',
  department: '',
  initiator: '',
  owner: '',
  occurrenceDate: '',
  dueDate: '',
  affectedProduct: { name: '', batchNumber: '' },
  investigation: { plan: '' },
  risk: 'Medium',
  // Additional fields based on event type
  ...(eventType === 'CAPA' && {
    rootCause: '',
    correctiveAction: '',
    preventiveAction: '',
    effectiveness: '',
  }),
  ...(eventType === 'Change Control' && {
    changeReason: '',
    impactAnalysis: '',
    implementationPlan: '',
    validation: '',
  }),
});

function CreateEventPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const eventType = location.state?.eventType || 'Deviation';
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => getInitialFormData(eventType));
  const [wizardSteps, setWizardSteps] = useState(EVENT_STEPS[eventType] || EVENT_STEPS['Deviation']);
  const dispatch = useDispatch();

  // Redirect to home if no event type is specified (except on first load)
  useEffect(() => {
    if (!location.state?.eventType) {
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setFormData(getInitialFormData(eventType));
    setWizardSteps(EVENT_STEPS[eventType] || EVENT_STEPS['Deviation']);
    setCurrentStep(1);
  }, [eventType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent, e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [parent]: {
            ...prev[parent],
            [name]: value
        }
    }));
  };

  const handleNext = () => {
    if (currentStep < wizardSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiPayload = {
      title: formData.title,
      event_type: formData.eventDetails.type,
      description: formData.eventDetails.description,
      date: formData.eventDetails.date,
      location: formData.eventDetails.location,
      responsible_person: formData.responsiblePerson,
      status: formData.status,
    };

    try {
      const response = await fetch('http://localhost:8000/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create Event');
      }
      const result = await response.json();
      console.log('Event created:', result);
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="wizard-form-section">
            <h3>Event Definition</h3>
            <div className="wizard-grid">
              <div className="wizard-input-group full-width">
                <label>Event Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder={`e.g., ${
                    eventType === 'Deviation' ? 'Temperature Excursion in Storage Area' :
                    eventType === 'CAPA' ? 'Recurring Product Defect Investigation' :
                    'Process Optimization Implementation'
                  }`} 
                  required 
                />
              </div>
              <div className="wizard-input-group">
                <label>Risk Level *</label>
                <select name="risk" value={formData.risk} onChange={handleChange} required>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="wizard-input-group full-width">
                <label>Scope *</label>
                <textarea 
                  name="scope" 
                  value={formData.scope} 
                  onChange={handleChange} 
                  rows="3" 
                  placeholder={`Define the ${
                    eventType === 'Deviation' ? 'impact and extent of the deviation' :
                    eventType === 'CAPA' ? 'scope of the problem and areas affected' :
                    'scope of the proposed change'
                  }`} 
                  required
                ></textarea>
              </div>
              {renderEventSpecificFields()}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="wizard-form-section">
            <h3>Affected Entity & Product</h3>
            <div className="wizard-grid">
                <div className="wizard-input-group">
                    <label>Department *</label>
                    <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g., Manufacturing" required />
                </div>
                <div className="wizard-input-group">
                    <label>Affected Product Name</label>
                    <input type="text" name="name" value={formData.affectedProduct.name} onChange={(e) => handleNestedChange('affectedProduct', e)} placeholder="e.g., Product A" />
                </div>
                <div className="wizard-input-group">
                    <label>Batch / Lot Number</label>
                    <input type="text" name="batchNumber" value={formData.affectedProduct.batchNumber} onChange={(e) => handleNestedChange('affectedProduct', e)} placeholder="e.g., PRODA-2405-001" />
                </div>
            </div>
          </div>
        );
      case 3:
        return (
             <div className="wizard-form-section">
                <h3>Scheduling & Team</h3>
                <div className="wizard-grid">
                    <div className="wizard-input-group">
                        <label>Initiator *</label>
                        <input type="text" name="initiator" value={formData.initiator} onChange={handleChange} placeholder="Person who discovered the event" required />
                    </div>
                    <div className="wizard-input-group">
                        <label>Owner / Lead *</label>
                        <input type="text" name="owner" value={formData.owner} onChange={handleChange} placeholder="Person responsible for the event" required />
                    </div>
                    <div className="wizard-input-group">
                        <label>Occurrence Date *</label>
                        <input type="date" name="occurrenceDate" value={formData.occurrenceDate} onChange={handleChange} required />
                    </div>
                    <div className="wizard-input-group">
                        <label>Due Date *</label>
                        <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
                    </div>
                </div>
            </div>
        );
      case 4:
        return (
            <div className="wizard-form-section">
                <h3>Plan & Actions</h3>
                <div className="wizard-grid">
                    <div className="wizard-input-group full-width">
                        <label>Initial Plan / Immediate Actions</label>
                        <textarea name="plan" value={formData.investigation.plan} onChange={(e) => handleNestedChange('investigation', e)} rows="4" placeholder="Describe the initial investigation plan or immediate actions taken."></textarea>
                    </div>
                </div>
            </div>
        );
      case 5:
        return (
            <div className="wizard-form-section">
                <h3>Review & Log</h3>
                <p className="summary-prompt">Please review all entered information for accuracy before logging the new event.</p>
                <div className="summary-view">
                    {Object.entries(formData).map(([key, value]) => {
                        if (typeof value === 'object' && value !== null) {
                            return Object.entries(value).map(([subKey, subValue]) => (
                                 subValue && <div key={`${key}-${subKey}`} className="summary-item">
                                    <dt>{`${key}.${subKey}`}</dt>
                                    <dd>{String(subValue)}</dd>
                                </div>
                            ));
                        }
                        return value && <div key={key} className="summary-item">
                            <dt>{key}</dt>
                            <dd>{String(value)}</dd>
                        </div>
                    })}
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  const renderEventSpecificFields = () => {
    switch (eventType) {
      case 'CAPA':
        return (
          <>
            <div className="wizard-input-group full-width">
              <label>Root Cause Analysis *</label>
              <textarea 
                name="rootCause" 
                value={formData.rootCause} 
                onChange={handleChange} 
                rows="3" 
                placeholder="Detailed analysis of the root cause..."
                required
              ></textarea>
            </div>
            <div className="wizard-input-group full-width">
              <label>Corrective Action Plan *</label>
              <textarea 
                name="correctiveAction" 
                value={formData.correctiveAction} 
                onChange={handleChange} 
                rows="3" 
                placeholder="Immediate actions to correct the issue..."
                required
              ></textarea>
            </div>
            <div className="wizard-input-group full-width">
              <label>Preventive Action Plan *</label>
              <textarea 
                name="preventiveAction" 
                value={formData.preventiveAction} 
                onChange={handleChange} 
                rows="3" 
                placeholder="Long-term prevention strategy..."
                required
              ></textarea>
            </div>
          </>
        );
      
      case 'Change Control':
        return (
          <>
            <div className="wizard-input-group full-width">
              <label>Reason for Change *</label>
              <textarea 
                name="changeReason" 
                value={formData.changeReason} 
                onChange={handleChange} 
                rows="3" 
                placeholder="Explain why this change is necessary..."
                required
              ></textarea>
            </div>
            <div className="wizard-input-group full-width">
              <label>Impact Analysis *</label>
              <textarea 
                name="impactAnalysis" 
                value={formData.impactAnalysis} 
                onChange={handleChange} 
                rows="3" 
                placeholder="Analyze potential impacts of the change..."
                required
              ></textarea>
            </div>
            <div className="wizard-input-group full-width">
              <label>Implementation Plan *</label>
              <textarea 
                name="implementationPlan" 
                value={formData.implementationPlan} 
                onChange={handleChange} 
                rows="3" 
                placeholder="Step-by-step implementation plan..."
                required
              ></textarea>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="wizard-layout">
      <div className="wizard-header">
        <h1 className="wizard-title">
          <FileCheck2 /> New {eventType}
        </h1>
        <nav className="wizard-stepper">
          {wizardSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`step-indicator ${index + 1 === currentStep ? 'active' : ''} ${index + 1 < currentStep ? 'completed' : ''}`}>
                <div className="step-circle">
                  {index + 1 < currentStep ? <Check size={12} /> : step.id}
                </div>
                <div className="step-label">
                  <span className="step-label-title">{step.title}</span>
                  <span className="step-label-desc">{step.description}</span>
                </div>
              </div>
              {index < wizardSteps.length - 1 && <div className="step-separator">&rarr;</div>}
            </React.Fragment>
          ))}
        </nav>
      </div>
      <form onSubmit={handleSubmit} className="wizard-content">
        {renderStepContent()}
      </form>
      <div className="wizard-footer">
        <button type="button" onClick={handlePrev} className="wizard-btn secondary" disabled={currentStep === 1}>
          <ArrowLeft size={14} /> Previous
        </button>
        {currentStep < wizardSteps.length ? (
          <button type="button" onClick={handleNext} className="wizard-btn primary">
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button type="submit" onClick={handleSubmit} className="wizard-btn success">
            <Save size={14} /> Log New Event
          </button>
        )}
      </div>
    </div>
  );
}

export default CreateEventPage;