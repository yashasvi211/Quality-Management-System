from fastapi import FastAPI, HTTPException, Request
import mysql.connector
from mysql.connector import Error
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from pydantic import BaseModel
from typing import Optional

# --- Pydantic model for the status update request ---
class StatusUpdate(BaseModel):
    status: str

# --- Pydantic models for creation endpoints ---

class DeviationCreate(BaseModel):
    title: str
    description: str
    owner_name: str
    risk: str
    status: str
    date_occurred: str  # Expecting ISO format string from frontend
    reported_by: Optional[str] = None
    impact: Optional[str] = None
    corrective_actions: Optional[str] = None

class CAPACreate(BaseModel):
    title: str
    responsiblePerson: str
    ownerName: str
    issueDescription: str
    risk: str
    rootCause: str
    correctiveActions: str
    preventiveActions: str
    dueDate: date

class ChangeControlCreate(BaseModel):
    title: str
    requestedBy: str
    changeDescription: str
    ownerName: str
    risk: str
    reasonForChange: str
    affectedAreas: str
    implementationPlan: str
    dueDate: Optional[date] = None

class AuditCreate(BaseModel):
    title: str
    type: str
    risk: Optional[str] = "Medium"
    status: Optional[str] = "Planned"
    scope: Optional[str] = None
    objective: Optional[str] = None
    auditee_name: str
    site_location: str
    country: str
    primary_contact: str
    contact_email: Optional[str] = None
    audit_date: date
    lead_auditor: str
    members: Optional[str] = None
    criteria: str
    agenda: Optional[str] = None

# Helper to convert date objects to strings for JSON serialization
def json_date_converter(o):
    if isinstance(o, date):
        return o.isoformat()

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection function
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='quality_management',
            user='root',
            password='00000000'
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None

# --- Universal Endpoint to Update Event Status ---
@app.patch("/event/{event_type}/{event_id}/status")
def update_event_status(event_type: str, event_id: int, status_update: StatusUpdate):
    table_map = {
        "audit": "audit",
        "deviation": "deviation",
        "capa": "capa",
        "change-control": "change_control"
    }
    
    table_name = table_map.get(event_type)
    if not table_name:
        raise HTTPException(status_code=400, detail="Invalid event type specified.")

    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor()
    try:
        query = f"UPDATE `{table_name}` SET `status` = %s WHERE `id` = %s"
        cursor.execute(query, (status_update.status, event_id))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Event not found in table {table_name} with ID {event_id}.")
            
        connection.commit()
        return {"message": f"Status for {event_type} {event_id} updated successfully to {status_update.status}."}
    except Error as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        connection.close()


@app.get("/events")
def get_all_events():
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor(dictionary=True)
    all_events = []
    
    try:
        # This query unifies different event types into a single format
        union_query = """
        (SELECT id, title, 'Audit' AS type, status, lead_auditor AS owner, audit_date AS due_date, risk FROM audit)
        UNION ALL
        (SELECT id, title, 'Deviation' AS type, status, owner_name AS owner, date_occurred AS due_date, risk FROM deviation)
        UNION ALL
        (SELECT id, title, 'CAPA' AS type, status, owner_name AS owner, due_date, risk FROM capa)
        UNION ALL
        (SELECT id, title, 'Change Control' AS type, status, owner_name AS owner, due_date, risk FROM change_control)
        """
        cursor.execute(union_query)
        all_events = cursor.fetchall()
        
        # Convert date objects to ISO format strings for JSON compatibility
        for event in all_events:
            if event.get('due_date'):
                event['due_date'] = json_date_converter(event['due_date'])
        
        return all_events
        
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching events: {e}")
    finally:
        cursor.close()
        connection.close()

# --- POST Endpoints for Creating New Records ---

@app.post("/deviation")
def create_deviation(deviation: DeviationCreate):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = connection.cursor()
    try:
        query = (
            "INSERT INTO deviation (title, date_occurred, description, owner_name, risk, status, reported_by, impact, corrective_actions) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        )
        cursor.execute(query, (
            deviation.title,
            deviation.date_occurred,
            deviation.description,
            deviation.owner_name,
            deviation.risk,
            deviation.status,
            deviation.reported_by,
            deviation.impact,
            deviation.corrective_actions
        ))
        connection.commit()
        return {"message": "Deviation created successfully.", "id": cursor.lastrowid}
    except Error as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        connection.close()

@app.post("/capa")
def create_capa(capa: CAPACreate):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = connection.cursor()
    try:
        query = (
            "INSERT INTO capa (title, responsible_person, owner_name, issue_description, risk, root_cause, corrective_actions, preventive_actions, due_date, status) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        )
        cursor.execute(query, (
            capa.title,
            capa.responsiblePerson,
            capa.ownerName,
            capa.issueDescription,
            capa.risk,
            capa.rootCause,
            capa.correctiveActions,
            capa.preventiveActions,
            capa.dueDate,
            'Planned'  # Default status for new CAPA
        ))
        connection.commit()
        return {"message": "CAPA created successfully.", "id": cursor.lastrowid}
    except Error as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        connection.close()

@app.post("/change_control")
def create_change_control(change_control: ChangeControlCreate):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = connection.cursor()
    try:
        query = (
            "INSERT INTO change_control (title, requested_by, change_description, owner_name, risk, reason_for_change, affected_areas, implementation_plan, due_date, status) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        )
        cursor.execute(query, (
            change_control.title,
            change_control.requestedBy,
            change_control.changeDescription,
            change_control.ownerName,
            change_control.risk,
            change_control.reasonForChange,
            change_control.affectedAreas,
            change_control.implementationPlan,
            change_control.dueDate,
            'Planned'  # Default status for new Change Control
        ))
        connection.commit()
        return {"message": "Change Control created successfully.", "id": cursor.lastrowid}
    except Error as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        connection.close()

@app.post("/audit")
def create_audit(audit: AuditCreate):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor()
    try:
        query = """
        INSERT INTO audit (
        title, type, risk, status, scope, objective, auditee_name, site_location, country,
        primary_contact, contact_email, audit_date, lead_auditor, members, criteria, agenda
        ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        """
        cursor.execute(query, (
            audit.title, audit.type, audit.risk, audit.status, audit.scope, audit.objective,
            audit.auditee_name, audit.site_location, audit.country, audit.primary_contact,
            audit.contact_email, audit.audit_date, audit.lead_auditor, audit.members,
            audit.criteria, audit.agenda
        ))
        connection.commit()
        return {"message": "Audit created successfully.", "id": cursor.lastrowid}
    except Error as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    finally:
        cursor.close()
        connection.close()


# --- GET Endpoints for Detail Pages ---

@app.get("/audit/{audit_id}")
def get_audit_by_id(audit_id: int):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM audit WHERE id = %s", (audit_id,))
        record = cursor.fetchone()
        if record is None:
            raise HTTPException(status_code=404, detail="Audit not found")
        if record.get('audit_date'):
            record['audit_date'] = json_date_converter(record['audit_date'])
        return record
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.get("/deviation/{deviation_id}")
def get_deviation_by_id(deviation_id: int):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM deviation WHERE id = %s", (deviation_id,))
        record = cursor.fetchone()
        if record is None:
            raise HTTPException(status_code=404, detail="Deviation not found")
        if record.get('date_occurred'):
            record['date_occurred'] = json_date_converter(record['date_occurred'])
        return record
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.get("/capa/{capa_id}")
def get_capa_by_id(capa_id: int):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM capa WHERE id = %s", (capa_id,))
        record = cursor.fetchone()
        if record is None:
            raise HTTPException(status_code=404, detail="CAPA not found")
        if record.get('due_date'):
            record['due_date'] = json_date_converter(record['due_date'])
        return record
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

@app.get("/change_control/{change_control_id}")
def get_change_control_by_id(change_control_id: int):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM change_control WHERE id = %s", (change_control_id,))
        record = cursor.fetchone()
        if record is None:
            raise HTTPException(status_code=404, detail="Change Control not found")
        if record.get('due_date'):
            record['due_date'] = json_date_converter(record['due_date'])
        return record
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()
