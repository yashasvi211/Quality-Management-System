from fastapi import FastAPI, HTTPException
import mysql.connector
from mysql.connector import Error
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Replace with your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Database connection function
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='quality_management',
            user='root',
            password='88888888'
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None
from fastapi import FastAPI, HTTPException
import mysql.connector
from mysql.connector import Error
from fastapi.middleware.cors import CORSMiddleware
from datetime import date

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
            password='88888888'
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return None

from datetime import date

# Helper to convert date objects to strings for JSON serialization
def json_date_converter(o):
    if isinstance(o, date):
        return o.isoformat()

@app.get("/events")
def get_all_events():
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor(dictionary=True)
    all_events = []
    
    try:
        # Fetch Audits
        query_audit = "SELECT id, title, 'Audit' AS type, 'Planned' AS status, lead_auditor AS owner, audit_date AS due_date, risk FROM audit"
        cursor.execute(query_audit)
        all_events.extend(cursor.fetchall())

        # Fetch Deviations
        query_deviation = "SELECT id, title, 'Deviation' AS type, 'In Progress' AS status, owner_name AS owner, date_occurred AS due_date, risk FROM deviation"
        cursor.execute(query_deviation)
        all_events.extend(cursor.fetchall())

        # Fetch CAPAs
        query_capa = "SELECT id, title, 'CAPA' AS type, 'In Progress' AS status, owner_name AS owner, due_date, risk FROM capa"
        cursor.execute(query_capa)
        all_events.extend(cursor.fetchall())

        # --- CORRECTED QUERY FOR CHANGE CONTROL ---
        # This now correctly selects the 'due_date' column from the table.
        query_cc = """
        SELECT id, title, 'Change Control' AS type, 'In Progress' AS status, owner_name AS owner, due_date, risk 
        FROM change_control
        """
        cursor.execute(query_cc)
        all_events.extend(cursor.fetchall())
        
        # Convert all date objects to strings for safe JSON serialization
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

# --- NEW: Endpoints to get a single event by ID ---

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
        cursor.execute("SELECT *, 'In Progress' as status FROM deviation WHERE id = %s", (deviation_id,))
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
        cursor.execute("SELECT *, 'In Progress' as status FROM capa WHERE id = %s", (capa_id,))
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
        cursor.execute("SELECT *, 'In Progress' as status FROM change_control WHERE id = %s", (change_control_id,))
        record = cursor.fetchone()
        if record is None:
            raise HTTPException(status_code=404, detail="Change Control not found")
        return record
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

# Endpoint for creating an audit record
@app.post("/audit")
def create_audit(audit_data: dict):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor()
    try:
        query = """
        INSERT INTO audit (title, type, risk, scope, objective, auditee_name, site_location, country, primary_contact, contact_email, audit_date, lead_auditor, members, criteria, agenda)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            audit_data.get('title'),
            audit_data.get('type'),
            audit_data.get('risk'),
            audit_data.get('scope') or 'N/A',
            audit_data.get('objective') or 'N/A',
            audit_data.get('auditee_name'),
            audit_data.get('site_location'),
            audit_data.get('country'),
            audit_data.get('primary_contact'),
            audit_data.get('contact_email'),
            audit_data.get('audit_date'),
            audit_data.get('lead_auditor'),
            audit_data.get('members'),
            audit_data.get('criteria'),
            audit_data.get('agenda')
        )
        cursor.execute(query, values)
        connection.commit()
        return {"message": "Audit created successfully", "id": cursor.lastrowid}
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        connection.close()

# Endpoint for creating a deviation record
@app.post("/deviation")
def create_deviation(deviation_data: dict):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor()
    try:
        query = """
        INSERT INTO deviation (title, date_occurred, description, owner_name, risk, reported_by, impact, corrective_actions)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            deviation_data.get('title'),
            deviation_data.get('dateOccurred') or '1970-01-01',
            deviation_data.get('description') or 'N/A',
            deviation_data.get('ownerName'),
            deviation_data.get('risk'),
            deviation_data.get('reportedBy'),
            deviation_data.get('impact') or 'N/A',
            deviation_data.get('correctiveActions') or 'N/A'
        )
        cursor.execute(query, values)
        connection.commit()
        return {"message": "Deviation created successfully", "id": cursor.lastrowid}
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        connection.close()
# Add this new endpoint to your existing server file

@app.get("/events")
def get_all_events():
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    # Use a dictionary cursor to get column names in the result
    cursor = connection.cursor(dictionary=True)
    all_events = []
    
    try:
        # Fetch Audits
        # Note: We add a 'type' and 'status' field manually and alias columns to be consistent
        query_audit = """
        SELECT id, title, 'Audit' AS type, 'Planned' AS status, lead_auditor AS owner, audit_date AS due_date, risk 
        FROM audit
        """
        cursor.execute(query_audit)
        audits = cursor.fetchall()
        all_events.extend(audits)

        # Fetch Deviations
        query_deviation = """
        SELECT id, title, 'Deviation' AS type, 'In Progress' AS status, owner_name AS owner, date_occurred AS due_date, risk 
        FROM deviation
        """
        cursor.execute(query_deviation)
        deviations = cursor.fetchall()
        all_events.extend(deviations)

        # Fetch CAPAs
        query_capa = """
        SELECT id, title, 'CAPA' AS type, 'In Progress' AS status, owner_name AS owner, due_date, risk 
        FROM capa
        """
        cursor.execute(query_capa)
        capas = cursor.fetchall()
        all_events.extend(capas)

        # Fetch Change Controls
        # Note: change_control has no date, so we select NULL for due_date
        query_cc = """
        SELECT id, title, 'Change Control' AS type, 'In Progress' AS status, owner_name AS owner, NULL AS due_date, risk 
        FROM change_control
        """
        cursor.execute(query_cc)
        change_controls = cursor.fetchall()
        all_events.extend(change_controls)
        
        return all_events
        
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while fetching events: {e}")
    finally:
        cursor.close()
        connection.close()
# Endpoint for creating a CAPA record
@app.post("/capa")
def create_capa(capa_data: dict):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor()
    try:
        query = """
        INSERT INTO capa (title, responsible_person, owner_name, issue_description, risk, root_cause, corrective_actions, preventive_actions, due_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            capa_data.get('title'),
            capa_data.get('responsiblePerson'),
            capa_data.get('ownerName'),
            capa_data.get('issueDescription') or 'N/A',
            capa_data.get('risk'),
            capa_data.get('rootCause') or 'N/A',
            capa_data.get('correctiveActions') or 'N/A',
            capa_data.get('preventiveActions') or 'N/A',
            capa_data.get('dueDate') or '1970-01-01'
        )
        cursor.execute(query, values)
        connection.commit()
        return {"message": "CAPA created successfully", "id": cursor.lastrowid}
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        connection.close()

# Endpoint for creating a change control record

@app.post("/change_control")
def create_change_control(cc_data: dict):
    connection = get_db_connection()
    if connection is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = connection.cursor()
    try:
        # Updated query to include due_date
        query = """
        INSERT INTO change_control (title, requested_by, change_description, owner_name, risk, reason_for_change, affected_areas, implementation_plan, due_date)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        # Updated values tuple to include dueDate
        values = (
            cc_data.get('title'),
            cc_data.get('requestedBy'),
            cc_data.get('changeDescription') or 'N/A',
            cc_data.get('ownerName'),
            cc_data.get('risk'),
            cc_data.get('reasonForChange') or 'N/A',
            cc_data.get('affectedAreas') or 'N/A',
            cc_data.get('implementationPlan') or 'N/A',
            cc_data.get('dueDate') # Get the new due date
        )
        cursor.execute(query, values)
        connection.commit()
        return {"message": "Change Control created successfully", "id": cursor.lastrowid}
    except Error as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
        connection.close()
