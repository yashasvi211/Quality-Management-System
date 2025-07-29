import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addEvent } from '../../redux/features/eventsSlice';
import { ArrowLeft, ArrowRight, Save, Check, ClipboardCheck, Edit3, Tags, Target, ScanSearch, Flag, Building2, Factory, MapPin, Globe, User, Mail, CalendarDays, Calendar, CalendarCheck, Award, Users2, ShieldCheck, BookMarked, ListChecks, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import './CreateAuditPage.css';

// --- Step Components for better organization and state handling ---

const Step1 = ({ data, setData }) => (
  <>
    <div className="wizard-form-section">
      <h3><ClipboardCheck size={16}/>Audit Definition</h3>
      <div className="wizard-grid">
        <div className="wizard-input-group">
          <label htmlFor="audit-title"><Edit3 size={12}/>Audit Title *</label>
          <input type="text" id="audit-title" name="title" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} required/>
        </div>
        <div className="wizard-input-group">
          <label htmlFor="audit-type"><Tags size={12}/>Audit Type *</label>
          <select id="audit-type" name="type" value={data.auditDetails.type} onChange={(e) => setData({ ...data, auditDetails: { ...data.auditDetails, type: e.target.value } })} required>
            <option value="">Select Type...</option>
            <option value="Internal">Internal (Self-Inspection)</option>
            <option value="Supplier/Vendor">Supplier / Vendor</option>
            <option value="Regulatory">Regulatory Agency</option>
            <option value="CRO">CRO / Partner</option>
            <option value="For-Cause">For-Cause</option>
            <option value="Pre-Approval Inspection (PAI)">Pre-Approval Inspection (PAI)</option>
            <option value="Surveillance">Surveillance</option>
          </select>
        </div>
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
    </div>
    <div className="wizard-form-section">
      <h3><Target size={16}/>Scope & Objective</h3>
      <div className="wizard-input-group full-width"><label htmlFor="audit-scope"><ScanSearch size={12}/>Audit Scope *</label><textarea id="audit-scope" name="scope" value={data.auditDetails.scope} onChange={(e) => setData({ ...data, auditDetails: { ...data.auditDetails, scope: e.target.value } })} rows="3" required/></div>
      <div className="wizard-input-group full-width"><label htmlFor="audit-objective"><Flag size={12}/>Audit Objective *</label><textarea id="audit-objective" name="objective" value={data.auditDetails.objective} onChange={(e) => setData({ ...data, auditDetails: { ...data.auditDetails, objective: e.target.value } })} rows="3" required/></div>
    </div>
  </>
);

const Step2 = ({ data, setData }) => (
    <>
        <div className="wizard-form-section">
            <h3><Building2 size={16}/>Auditee Information</h3>
            <div className="wizard-grid">
                <div className="wizard-input-group"><label><Factory size={12}/>Auditee Name *</label><input type="text" name="name" value={data.auditee.name} onChange={(e) => setData({...data, auditee: {...data.auditee, name: e.target.value}})} required/></div>
                <div className="wizard-input-group"><label><MapPin size={12}/>Site Location *</label><input type="text" name="siteLocation" value={data.auditee.siteLocation} onChange={(e) => setData({...data, auditee: {...data.auditee, siteLocation: e.target.value}})} required/></div>
                <div className="wizard-input-group"><label><Globe size={12}/>Country *</label><input type="text" name="country" value={data.auditee.country} onChange={(e) => setData({...data, auditee: {...data.auditee, country: e.target.value}})} required/></div>
            </div>
        </div>
        <div className="wizard-form-section">
            <h3><User size={16}/>Key Auditee Contacts</h3>
            <div className="wizard-grid">
                <div className="wizard-input-group"><label><User size={12}/>Primary Contact *</label><input type="text" name="primaryContact" value={data.auditee.primaryContact} onChange={(e) => setData({...data, auditee: {...data.auditee, primaryContact: e.target.value}})} required/></div>
                <div className="wizard-input-group"><label><Mail size={12}/>Contact Email</label><input type="email" name="contactEmail" value={data.auditee.contactEmail} onChange={(e) => setData({...data, auditee: {...data.auditee, contactEmail: e.target.value}})}/></div>
            </div>
        </div>
    </>
);

const Step3 = ({ data, setData }) => (
    <>
        <div className="wizard-form-section">
            <h3><CalendarDays size={16}/>Audit Schedule</h3>
            <div className="wizard-grid">
                <div className="wizard-input-group">
                    <label htmlFor="date"><Calendar size={12}/>Date *</label>
                    <input type="date" id="date" name="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} required/>
                </div>
            </div>
        </div>
        <div className="wizard-form-section">
            <h3><Users2 size={16}/>Audit Team</h3>
            <div className="wizard-grid">
                <div className="wizard-input-group"><label><Award size={12}/>Lead Auditor *</label><input type="text" name="leadAuditor" value={data.team.leadAuditor} onChange={(e) => setData({...data, team: {...data.team, leadAuditor: e.target.value}})} required/></div>
                <div className="wizard-input-group"><label><Users2 size={12}/>Other Auditors</label><input type="text" name="members" value={data.team.members} onChange={(e) => setData({...data, team: {...data.team, members: e.target.value}})} placeholder="Comma-separated"/></div>
            </div>
        </div>
    </>
);

const Step4 = ({ data, setData }) => (
    <>
        <div className="wizard-form-section">
            <h3><ShieldCheck size={16}/>Audit Criteria & Standards</h3>
            <div className="wizard-input-group full-width"><label><BookMarked size={12}/>Applicable Regulations *</label><textarea name="criteria" value={data.plan.criteria} onChange={(e) => setData({...data, plan: {...data.plan, criteria: e.target.value}})} rows="4" required/></div>
        </div>
        <div className="wizard-form-section">
            <h3><ListChecks size={16}/>Audit Agenda</h3>
            <div className="wizard-input-group full-width"><label><FileText size={12}/>Audit Plan / Agenda</label><textarea name="agenda" value={data.plan.agenda} onChange={(e) => setData({...data, plan: {...data.plan, agenda: e.target.value}})} rows="6" placeholder="Day 1: ...&#10;Day 2: ..."/></div>
        </div>
    </>
);

const Step5 = ({ data }) => {
    const renderSummaryItem = (label, value) => value ? <div className="summary-item"><dt>{label}</dt><dd>{value}</dd></div> : null;
    return (
        <div className="wizard-form-section">
            <h3><CheckCircle2 size={16}/>Review Audit Details</h3>
            <p className="summary-prompt">Please review all entered information for accuracy before logging the new audit record.</p>
            <div className="summary-view">
                {renderSummaryItem('Audit Title', data.title)}
                {renderSummaryItem('Audit Type', data.auditDetails.type)}
                {renderSummaryItem('Auditee', data.auditee.name)}
                {renderSummaryItem('Location', data.auditee.siteLocation)}
                {renderSummaryItem('Date', data.date)}
                {renderSummaryItem('Lead Auditor', data.team.leadAuditor)}
                {renderSummaryItem('Team', data.team.members)}
                <div className="summary-item full-width"><dt>Scope</dt><dd>{data.auditDetails.scope}</dd></div>
                <div className="summary-item full-width"><dt>Criteria</dt><dd>{data.plan.criteria}</dd></div>
            </div>
        </div>
    );
};


// --- Main Wizard Component ---

const WIZARD_STEPS = [
  { id: 1, title: 'Initialization', description: 'Type, Scope & Objective', component: Step1 },
  { id: 2, title: 'Auditee Details', description: 'Entity & Location', component: Step2 },
  { id: 3, title: 'Scheduling & Team', description: 'Dates & Personnel', component: Step3 },
  { id: 4, title: 'Audit Plan', description: 'Criteria & Agenda', component: Step4 },
  { id: 5, title: 'Review & Log', description: 'Confirm Details', component: Step5 },
];

const initialFormData = {
    type: 'Audit',
    title: '',
    auditDetails: { type: 'Internal', scope: '', objective: '' },
    auditee: { name: '', siteLocation: '', country: '', primaryContact: '', contactEmail: '' },
    date: '', // Single date field for the audit
    team: { leadAuditor: '', members: '' },
    plan: { criteria: '', agenda: '' },
    risk: 'Medium', // Default risk level
};

function CreateAuditPage() {
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

    // Map frontend fields to backend/database fields and ensure all required fields are present
    const apiPayload = {
      title: formData.title,
      type: formData.auditDetails.type,
      scope: formData.auditDetails.scope,
      objective: formData.auditDetails.objective,
      auditee_name: formData.auditee.name,
      site_location: formData.auditee.siteLocation,
      country: formData.auditee.country,
      primary_contact: formData.auditee.primaryContact,
      contact_email: formData.auditee.contactEmail,
      audit_date: formData.date,
      lead_auditor: formData.team.leadAuditor,
      team_members: formData.team.members,
      criteria: formData.plan.criteria,
      agenda: formData.plan.agenda,
      risk: formData.risk,
    };

    try {
      const response = await fetch('http://localhost:8000/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(errorData.detail || 'Failed to create Audit');
        throw new Error(errorData.detail || 'Failed to create Audit');
      }

      const result = await response.json();
      console.log('Audit created:', result);
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
        <h1 className="wizard-title"><ClipboardCheck /> New Audit Record</h1>
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
          <button type="submit" onClick={handleSubmit} className="wizard-btn success"><Save size={14} /> Log New Audit</button>
        }
      </div>
    </div>
  );
}

export default CreateAuditPage;
