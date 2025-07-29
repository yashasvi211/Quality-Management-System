import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../../redux/features/eventsSlice';
import { ArrowLeft, ArrowRight, Save, Check, ClipboardCheck, Edit3, FileText, User, Layers, AlertCircle, Map, ListChecks, CheckCircle2, AlertTriangle } from 'lucide-react';
import '../CreateAuditPage/CreateAuditPage.css';

// Step 1: Basic Change Control Info
const Step1 = ({ data, setData }) => (
  <>
    <div className="wizard-form-section">
      <h3><ClipboardCheck size={16}/>Change Control Details</h3>
      <div className="wizard-grid">
        {/* title: The title of the change control event (required) */}
        <div className="wizard-input-group">
          <label htmlFor="cc-title"><Edit3 size={12}/>Change Title *</label>
          <input type="text" id="cc-title" name="title" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} required/>
        </div>
        {/* requestedBy: Person requesting the change */}
        <div className="wizard-input-group">
          <label htmlFor="requested-by"><User size={12}/>Requested By *</label>
          <input type="text" id="requested-by" name="requestedBy" value={data.requestedBy} onChange={e => setData({ ...data, requestedBy: e.target.value })} required/>
        </div>
      </div>
    </div>
    <div className="wizard-form-section">
      {/* changeDescription: Description of the change */}
      <div className="wizard-input-group full-width">
        <label htmlFor="change-description"><FileText size={12}/>Change Description *</label>
        <textarea id="change-description" name="changeDescription" value={data.changeDescription} onChange={e => setData({ ...data, changeDescription: e.target.value })} rows="4" required/>
      </div>
    </div>
    <div className="wizard-form-section">
      {/* ownerName: Name of the owner responsible for the change control */}
      <div className="wizard-input-group">
        <label htmlFor="owner-name"><User size={12}/>Owner Name *</label>
        <input type="text" id="owner-name" name="ownerName" value={data.ownerName} onChange={e => setData({ ...data, ownerName: e.target.value })} required/>
      </div>
    </div>
    <div className="wizard-form-section">
      {/* risk: The risk level associated with the change control event */}
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

// Step 2: Reason & Impact
const Step2 = ({ data, setData }) => (
  <>
    <div className="wizard-form-section">
      <h3><AlertCircle size={16}/>Reason & Impact</h3>
      <div className="wizard-grid">
        {/* reasonForChange: Why the change is needed */}
        <div className="wizard-input-group">
          <label htmlFor="reason-for-change"><AlertCircle size={12}/>Reason for Change *</label>
          <input type="text" id="reason-for-change" name="reasonForChange" value={data.reasonForChange} onChange={e => setData({ ...data, reasonForChange: e.target.value })} required/>
        </div>
        {/* affectedAreas: Areas affected by the change */}
        <div className="wizard-input-group">
          <label htmlFor="affected-areas"><Layers size={12}/>Affected Areas *</label>
          <input type="text" id="affected-areas" name="affectedAreas" value={data.affectedAreas} onChange={e => setData({ ...data, affectedAreas: e.target.value })} required/>
        </div>
      </div>
    </div>
  </>
);

// Step 3: Implementation Plan
const Step3 = ({ data, setData }) => (
  <>
    <div className="wizard-form-section">
      <h3><ListChecks size={16}/>Implementation Plan</h3>
      {/* implementationPlan: Plan for implementing the change */}
      <div className="wizard-input-group full-width">
        <label htmlFor="implementation-plan"><ListChecks size={12}/>Implementation Plan *</label>
        <textarea id="implementation-plan" name="implementationPlan" value={data.implementationPlan} onChange={e => setData({ ...data, implementationPlan: e.target.value })} rows="4" required/>
      </div>
    </div>
  </>
);

// Step 4: Review & Submit
const Step4 = ({ data }) => {
  const renderSummaryItem = (label, value) => value ? <div className="summary-item"><dt>{label}</dt><dd>{value}</dd></div> : null;
  return (
    <div className="wizard-form-section">
      <h3><CheckCircle2 size={16}/>Review Change Control Details</h3>
      <p className="summary-prompt">Please review all entered information for accuracy before logging the new change control record.</p>
      <div className="summary-view">
        {renderSummaryItem('Title', data.title)}
        {renderSummaryItem('Requested By', data.requestedBy)}
        {renderSummaryItem('Change Description', data.changeDescription)}
        {renderSummaryItem('Reason for Change', data.reasonForChange)}
        {renderSummaryItem('Affected Areas', data.affectedAreas)}
        {renderSummaryItem('Implementation Plan', data.implementationPlan)}
        {renderSummaryItem('Owner Name', data.ownerName)}
        {renderSummaryItem('Risk', data.risk)}
      </div>
    </div>
  );
};

const WIZARD_STEPS = [
  { id: 1, title: 'Change Details', component: Step1 },
  { id: 2, title: 'Reason & Impact', component: Step2 },
  { id: 3, title: 'Implementation Plan', component: Step3 },
  { id: 4, title: 'Review & Log', component: Step4 },
];

const initialFormData = {
  title: '',
  changeDescription: '',
  reasonForChange: '',
  requestedBy: '',
  affectedAreas: '',
  implementationPlan: '',
  ownerName: '',
  risk: 'Medium',
};

function CreateChangeControlPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleNext = () => currentStep < WIZARD_STEPS.length && setCurrentStep(currentStep + 1);
  const handlePrev = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    // Correctly map the flat formData state to the API payload
    const apiPayload = {
      title: formData.title,
      requestedBy: formData.requestedBy,
      changeDescription: formData.changeDescription,
      ownerName: formData.ownerName,
      risk: formData.risk,
      reasonForChange: formData.reasonForChange,
      affectedAreas: formData.affectedAreas,
      implementationPlan: formData.implementationPlan,
    };

    try {
      const response = await fetch('http://localhost:8000/change_control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(errorData.detail || 'Failed to create Change Control');
        throw new Error(errorData.detail || 'Failed to create Change Control');
      }

      const result = await response.json();
      console.log('Change Control created:', result);
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
        <h1 className="wizard-title"><ClipboardCheck /> New Change Control Record</h1>
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
          <button type="submit" onClick={handleSubmit} className="wizard-btn success"><Save size={14} /> Log New Change Control</button>
        }
      </div>
    </div>
  );
}

export default CreateChangeControlPage;
