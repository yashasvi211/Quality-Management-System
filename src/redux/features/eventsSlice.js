import { createSlice } from '@reduxjs/toolkit';

// More detailed initial state to reflect a real QMS
const initialState = {
  items: [
    {
      id: 'AUD-2025-002',
      type: 'Audit',
      title: 'Annual GMP Compliance for Mfg Line B',
      status: 'Planned',
      risk: 'Medium',
      owner: 'QA Manager',
      creationDate: '2025-06-15T11:00:00Z',
      // --- New Detailed Audit Fields ---
      auditDetails: {
        type: 'Internal',
        scope: 'Manufacturing, packaging, and QC testing of all products on Line B from Jan 1, 2025 to present.',
        objective: 'To verify compliance with cGMP as per 21 CFR 210/211 and internal SOPs.',
      },
      auditee: {
        name: 'Manufacturing Line B',
        siteLocation: 'Bengaluru, India',
        country: 'India',
        primaryContact: 'Site Lead',
      },
      schedule: {
        proposedStartDate: '2025-09-01',
        proposedEndDate: '2025-09-03',
        confirmedStartDate: '2025-09-10',
        confirmedEndDate: '2025-09-12',
      },
      team: {
        leadAuditor: 'Sakthivel G',
        members: ['Jane Smith', 'John Doe'],
      },
      plan: {
        criteria: 'FDA 21 CFR Part 211, ISO 13485:2016, ICH Q7, Company SOP-QA-001.',
        agenda: 'Day 1: Opening Meeting, Facility Tour, Documentation Review (QMS)...\nDay 2: Production Area Review, Warehouse Operations...\nDay 3: QC Lab, Closing Meeting...',
      },
    },
    {
      id: 'DEV-2025-001',
      type: 'Deviation',
      title: 'Line 3 temperature out of range',
      status: 'Investigation',
      risk: 'Medium',
      severity: 'High',
      owner: 'Alice Johnson',
      initiator: 'Charlie Brown',
      department: 'Manufacturing',
      creationDate: '2025-07-23T09:01:00Z',
      occurrenceDate: '2025-07-22T10:45:00Z',
      dueDate: '2025-08-22T23:59:00Z',
      description: 'During routine monitoring of Manufacturing Line 3, the temperature of Reactor R-101 was observed to be at 85°C, exceeding the validated upper limit of 80°C. The excursion lasted for approximately 15 minutes.',
      affectedProduct: {
        name: 'Product A',
        batchNumber: 'PRODA-2405-001',
        disposition: 'Quarantined',
        equipmentId: 'Reactor R-101',
      },
      investigation: {
        plan: '1. Review sensor calibration records for R-101.\n2. Interview operator Charlie Brown.\n3. Analyze batch controller logs for anomalies.\n4. Test affected batch sample for degradation.',
        rootCause: 'The preventative maintenance schedule for temperature sensor (SN-4815) was not followed due to a clerical error in the CMMS, leading to calibration drift.',
        rcaMethod: '5 Whys',
      },
      relatedRecords: {
        capas: ['CAPA-2025-012'],
      }
    },
    {
      id: 'CAPA-2025-012',
      type: 'CAPA',
      title: 'Update CMMS workflow for PM deferrals',
      status: 'In Progress',
      risk: 'Low',
      severity: 'Low',
      owner: 'Bob Williams',
      initiator: 'Alice Johnson',
      department: 'Engineering',
      creationDate: '2025-07-24T14:00:00Z',
      dueDate: '2025-09-30T23:59:00Z',
      description: 'Corrective and Preventive Action stemming from DEV-2025-001. The goal is to prevent clerical errors in the CMMS for preventative maintenance scheduling.',
    }
  ],
  status: 'idle',
  error: null,
};


const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    addEvent: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(formData) {
        // This prepare function now handles both simple and complex event structures
        const idPrefix = formData.type.substring(0, 4).toUpperCase();
        const newId = `${idPrefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
        
        const baseEvent = {
            id: newId,
            title: formData.title,
            type: formData.type,
            status: formData.status || 'Planned',
            risk: formData.risk || 'Medium',
            owner: formData.team?.leadAuditor || formData.owner,
            creationDate: new Date().toISOString(),
        };

        // If it's a detailed audit, add the nested structure
        if(formData.type === 'Audit') {
            return {
                payload: {
                    ...baseEvent,
                    auditDetails: formData.auditDetails,
                    auditee: formData.auditee,
                    schedule: formData.schedule,
                    team: formData.team,
                    plan: formData.plan,
                }
            }
        }

        // Handle other event types (simplified for now)
        return {
          payload: {
            ...baseEvent,
            ...formData,
          },
        };
      },
    },
    updateEvent(state, action) {
        const { id, ...data } = action.payload;
        const existingEvent = state.items.find(event => event.id === id);
        if (existingEvent) {
            Object.assign(existingEvent, data);
        }
    }
  },
});

export const { addEvent, updateEvent } = eventsSlice.actions;

export const selectAllEvents = (state) => state.events.items;
export const selectEventById = (state, eventId) =>
  state.events.items.find((event) => event.id === eventId);

export default eventsSlice.reducer;
