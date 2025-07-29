import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../../redux/features/eventsSlice';
import { ArrowLeft, ArrowRight, Save, Check, ClipboardCheck, Edit3, Calendar, User, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import '../CreateAuditPage/CreateAuditPage.css';

// Step 1: Basic Deviation Info
const Step1 = ({ data, setData }) => (
  <>
    <div className="wizard-form-section">
      <h3><ClipboardCheck size={16}/>Deviation Details</h3>
      <div className="wizard-grid">
        {/* title: The title of the deviation event (required) */}
        <div className="wizard-input-group">
          <label htmlFor="deviation-title"><Edit3 size={12}/>Deviation Title *</label>
          <input type="text" id="deviation-title" name="title" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} required/>
        </div>
        {/* dateOccurred: Date when the deviation occurred */}
        <div className="wizard-input-group">
          <label htmlFor="date-occurred"><Calendar size={12}/>Date Occurred *</label>
          <input type="date" id="date-occurred" name="dateOccurred" value={data.dateOccurred} onChange={e => setData({ ...data, dateOccurred: e.target.value })} required/>
        </div>
      </div>
    </div>
    <div className="wizard-form-section">
      {/* description: Detailed description of the deviation */}
      <div className="wizard-input-group full-width">
        <label htmlFor="deviation-description"><FileText size={12}/>Description *</label>
        <textarea id="deviation-description" name="description" value={data.description} onChange={e => setData({ ...data, description: e.target.value })} rows="4" required/>
      </div>
    </div>
    <div className="wizard-form-section">
      {/* ownerName: The name of the owner responsible for the deviation */}
      <div className="wizard-input-group">
        <label htmlFor="owner-name"><User size={12}/>Owner Name *</label>
        <input type="text" id="owner-name" name="ownerName" value={data.ownerName} onChange={e => setData({ ...data, ownerName: e.target.value })} required/>
      </div>
    </div>
    <div className="wizard-form-section">
      {/* risk: The risk level associated with the deviation */}
      <div className="wizard-input-group">
        <label htmlFor="risk"><AlertTriangle size={12}/>Risk *</label>
        <select id="risk" name="risk" value={data.risk} onChange={e => setData({ ...data, risk: e.target.value })} required>
          <option value="None">None</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
    </div>
  </>
);

// Step 2: Reporting & Impact
const Step2 = ({ data, setData }) => (
  <>
    <div className="wizard-form-section">
      <h3><User size={16}/>Reporting & Impact</h3>
      <div className="wizard-grid">
        {/* reportedBy: Person who reported the deviation */}
        <div className="wizard-input-group">
          <label htmlFor="reported-by"><User size={12}/>Reported By *</label>
          <input type="text" id="reported-by" name="reportedBy" value={data.reportedBy} onChange={e => setData({ ...data, reportedBy: e.target.value })} required/>
        </div>
        {/* impact: Description of the impact */}
        <div className="wizard-input-group">
          <label htmlFor="impact"><AlertTriangle size={12}/>Impact *</label>
          <input type="text" id="impact" name="impact" value={data.impact} onChange={e => setData({ ...data, impact: e.target.value })} required/>
        </div>
      </div>
    </div>
  </>
);

// Step 3: Corrective Actions
const Step3 = ({ data, setData }) => (
  <>
    <div className="wizard-form-section">
      <h3><Check size={16}/>Corrective Actions</h3>
      {/* correctiveActions: Actions taken to correct the deviation */}
      <div className="wizard-input-group full-width">
        <label htmlFor="corrective-actions"><Check size={12}/>Corrective Actions *</label>
        <textarea id="corrective-actions" name="correctiveActions" value={data.correctiveActions} onChange={e => setData({ ...data, correctiveActions: e.target.value })} rows="4" required/>
      </div>
    </div>
  </>
);

// Step 4: Review & Submit
const Step4 = ({ data }) => {
  const renderSummaryItem = (label, value) => value ? <div className="summary-item"><dt>{label}</dt><dd>{value}</dd></div> : null;
  return (
    <div className="wizard-form-section">
      <h3><CheckCircle2 size={16}/>Review Deviation Details</h3>
      <p className="summary-prompt">Please review all entered information for accuracy before logging the new deviation record.</p>
      <div className="summary-view">
        {renderSummaryItem('Title', data.title)}
        {renderSummaryItem('Date Occurred', data.dateOccurred)}
        {renderSummaryItem('Description', data.description)}
        {renderSummaryItem('Owner Name', data.ownerName)}
        {renderSummaryItem('Reported By', data.reportedBy)}
        {renderSummaryItem('Impact', data.impact)}
        {renderSummaryItem('Corrective Actions', data.correctiveActions)}
        {renderSummaryItem('Risk', data.risk)}
      </div>
    </div>
  );
};

const WIZARD_STEPS = [
  { id: 1, title: 'Deviation Details', component: Step1 },
  { id: 2, title: 'Reporting & Impact', component: Step2 },
  { id: 3, title: 'Corrective Actions', component: Step3 },
  { id: 4, title: 'Review & Log', component: Step4 },
];

const initialFormData = {
  title: '', // The title of the deviation event
  description: '', // Detailed description of the deviation
  dateOccurred: '', // Date when the deviation occurred
  reportedBy: '', // Person who reported the deviation
  impact: '', // Description of the impact
  correctiveActions: '', // Actions taken to correct the deviation
  ownerName: '', // The name of the owner responsible for the deviation
  risk: 'Medium', // Default risk level
};

function CreateDeviationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleNext = () => currentStep < WIZARD_STEPS.length && setCurrentStep(currentStep + 1);
  const handlePrev = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // Validate required date field
    if (!formData.dateOccurred) {
      setSubmitError('Please select a valid date for "Date Occurred".');
      return;
    }

    // Map frontend fields to backend/database fields and ensure all required fields are present
    const apiPayload = {
      title: formData.title,
      date_occurred: formData.dateOccurred, // match DB field name
      description: formData.description,
      owner_name: formData.ownerName,
      risk: formData.risk,
      status: 'Planned', // default status for new deviation
      reported_by: formData.reportedBy,
      impact: formData.impact,
      corrective_actions: formData.correctiveActions,
    };

    try {
      const response = await fetch('http://localhost:8000/deviation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(errorData.detail || 'Failed to create Deviation');
        throw new Error(errorData.detail || 'Failed to create Deviation');
      }

      const result = await response.json();
      console.log('Deviation created:', result);
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const CurrentStepComponent = WIZARD_STEPS[currentStep - 1].component;

  return (
    <div className="wizard-layout">
      <div className="wizard-header">
        <h1 className="wizard-title"><ClipboardCheck /> New Deviation Record</h1>
        <nav className="wizard-stepper">
          {WIZARD_STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`step-indicator ${index + 1 === currentStep ? 'active' : ''} ${index + 1 < currentStep ? 'completed' : ''}`}>
                <div className="step-circle">{index + 1 < currentStep ? <Check size={12} /> : step.id}</div>
                <div className="step-label"><span className="step-label-title">{step.title}</span></div>
              </div>
              {index < WIZARD_STEPS.length - 1 && <div className="step-separator">&rarr;</div>}
            </React.Fragment>
          ))}
        </nav>
      </div>
      {submitError && (
        <div className="wizard-error" style={{ color: 'red', margin: '1em 0' }}>
          {submitError}
        </div>
      )}
      {submitSuccess && (
        <div className="wizard-success" style={{ color: 'green', margin: '1em 0', fontWeight: 'bold' }}>
          Data submitted successfully!
        </div>
      )}
      <form onSubmit={handleSubmit} className="wizard-content">
        <CurrentStepComponent data={formData} setData={setFormData} />
      </form>
      <div className="wizard-footer">
        <button type="button" onClick={handlePrev} className="wizard-btn secondary" disabled={currentStep === 1}><ArrowLeft size={14} /> Previous</button>
        {currentStep < WIZARD_STEPS.length ? 
          <button type="button" onClick={handleNext} className="wizard-btn primary">Next <ArrowRight size={14} /></button> : 
          <button type="submit" onClick={handleSubmit} className="wizard-btn success"><Save size={14} /> Log New Deviation</button>
        }
      </div>
    </div>
  );
}

export default CreateDeviationPage;
