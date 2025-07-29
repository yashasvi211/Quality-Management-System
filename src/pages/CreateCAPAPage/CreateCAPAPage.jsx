import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../../redux/features/eventsSlice';
import { ArrowLeft, ArrowRight, Save, Check, ClipboardCheck, Edit3, FileText, User, AlertTriangle, ListChecks, Calendar, CheckCircle2 } from 'lucide-react';
import '../CreateAuditPage/CreateAuditPage.css';

// Step 1: Basic CAPA Info
const Step1 = ({ data, setData }) => (
  <>
    <div className="wizard-form-section">
      <h3><ClipboardCheck size={16}/>CAPA Details</h3>
      <div className="wizard-grid">
        {/* title: The title of the CAPA event (required) */}
        <div className="wizard-input-group">
          <label htmlFor="capa-title"><Edit3 size={12}/>CAPA Title *</label>
          <input type="text" id="capa-title" name="title" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} required/>
        </div>
        {/* responsiblePerson: Person responsible for CAPA */}
        <div className="wizard-input-group">
          <label htmlFor="responsible-person"><User size={12}/>Responsible Person *</label>
          <input type="text" id="responsible-person" name="responsiblePerson" value={data.responsiblePerson} onChange={e => setData({ ...data, responsiblePerson: e.target.value })} required/>
        </div>
        {/* ownerName: Person who owns the CAPA */}
        <div className="wizard-input-group">
          <label htmlFor="owner-name"><User size={12}/>Owner Name *</label>
          <input type="text" id="owner-name" name="ownerName" value={data.ownerName} onChange={e => setData({ ...data, ownerName: e.target.value })} required/>
        </div>
      </div>
    </div>
    <div className="wizard-form-section">
      {/* issueDescription: Description of the issue requiring CAPA */}
      <div className="wizard-input-group full-width">
        <label htmlFor="issue-description"><FileText size={12}/>Issue Description *</label>
        <textarea id="issue-description" name="issueDescription" value={data.issueDescription} onChange={e => setData({ ...data, issueDescription: e.target.value })} rows="4" required/>
      </div>
    </div>
    <div className="wizard-form-section">
      {/* risk: Risk level associated with the CAPA */}
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

// Step 2: Root Cause & Actions
const Step2 = ({ data, setData }) => (
  <>
    <div className="wizard-form-section">
      <h3><AlertTriangle size={16}/>Root Cause & Actions</h3>
      <div className="wizard-grid">
        {/* rootCause: Root cause analysis */}
        <div className="wizard-input-group">
          <label htmlFor="root-cause"><AlertTriangle size={12}/>Root Cause *</label>
          <input type="text" id="root-cause" name="rootCause" value={data.rootCause} onChange={e => setData({ ...data, rootCause: e.target.value })} required/>
        </div>
      </div>
      {/* correctiveActions: Actions to correct the issue */}
      <div className="wizard-input-group full-width">
        <label htmlFor="corrective-actions"><ListChecks size={12}/>Corrective Actions *</label>
        <textarea id="corrective-actions" name="correctiveActions" value={data.correctiveActions} onChange={e => setData({ ...data, correctiveActions: e.target.value })} rows="3" required/>
      </div>
      {/* preventiveActions: Actions to prevent recurrence */}
      <div className="wizard-input-group full-width">
        <label htmlFor="preventive-actions"><ListChecks size={12}/>Preventive Actions *</label>
        <textarea id="preventive-actions" name="preventiveActions" value={data.preventiveActions} onChange={e => setData({ ...data, preventiveActions: e.target.value })} rows="3" required/>
      </div>
    </div>
  </>
);

// Step 3: Due Date & Review
const Step3 = ({ data, setData }) => (
  <>
    <div className="wizard-form-section">
      <h3><Calendar size={16}/>Due Date</h3>
      {/* dueDate: Due date for CAPA completion */}
      <div className="wizard-input-group">
        <label htmlFor="due-date"><Calendar size={12}/>Due Date *</label>
        <input type="date" id="due-date" name="dueDate" value={data.dueDate} onChange={e => setData({ ...data, dueDate: e.target.value })} required/>
      </div>
    </div>
  </>
);

// Step 4: Review & Submit
const Step4 = ({ data }) => {
  const renderSummaryItem = (label, value) => value ? <div className="summary-item"><dt>{label}</dt><dd>{value}</dd></div> : null;
  return (
    <div className="wizard-form-section">
      <h3><CheckCircle2 size={16}/>Review CAPA Details</h3>
      <p className="summary-prompt">Please review all entered information for accuracy before logging the new CAPA record.</p>
      <div className="summary-view">
        {renderSummaryItem('Title', data.title)}
        {renderSummaryItem('Responsible Person', data.responsiblePerson)}
        {renderSummaryItem('Owner Name', data.ownerName)}
        {renderSummaryItem('Issue Description', data.issueDescription)}
        {renderSummaryItem('Root Cause', data.rootCause)}
        {renderSummaryItem('Corrective Actions', data.correctiveActions)}
        {renderSummaryItem('Preventive Actions', data.preventiveActions)}
        {renderSummaryItem('Due Date', data.dueDate)}
        {renderSummaryItem('Risk', data.risk)}
      </div>
    </div>
  );
};

const WIZARD_STEPS = [
  { id: 1, title: 'CAPA Details', component: Step1 },
  { id: 2, title: 'Root Cause & Actions', component: Step2 },
  { id: 3, title: 'Due Date', component: Step3 },
  { id: 4, title: 'Review & Log', component: Step4 },
];

const initialFormData = {
  title: '', // The title of the CAPA event
  issueDescription: '', // Description of the issue requiring CAPA
  rootCause: '', // Root cause analysis
  correctiveActions: '', // Actions to correct the issue
  preventiveActions: '', // Actions to prevent recurrence
  responsiblePerson: '', // Person responsible for CAPA
  dueDate: '', // Due date for CAPA completion
  ownerName: '', // The name of the owner responsible for the CAPA
  risk: 'Medium', // Default risk level
};

function CreateCAPAPage() {
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

    // Use camelCase keys to match the backend's expectations
    const apiPayload = {
      title: formData.title,
      responsiblePerson: formData.responsiblePerson,
      ownerName: formData.ownerName,
      issueDescription: formData.issueDescription,
      risk: formData.risk,
      rootCause: formData.rootCause,
      correctiveActions: formData.correctiveActions,
      preventiveActions: formData.preventiveActions,
      dueDate: formData.dueDate,
    };

    try {
      const response = await fetch('http://localhost:8000/capa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(errorData.detail || 'Failed to create CAPA');
        throw new Error(errorData.detail || 'Failed to create CAPA');
      }

      const result = await response.json();
      console.log('CAPA created:', result);
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const CurrentStepComponent = WIZARD_STEPS[currentStep - 1].component;

  return (
    <div className="wizard-layout">
      <div className="wizard-header">
        <h1 className="wizard-title"><ClipboardCheck /> New CAPA Record</h1>
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
          <button type="submit" onClick={handleSubmit} className="wizard-btn success"><Save size={14} /> Log New CAPA</button>
        }
      </div>
    </div>
  );
}

export default CreateCAPAPage;
