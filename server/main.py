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
        query = """
        INSERT INTO change_control (title, requested_by, change_description, owner_name, risk, reason_for_change, affected_areas, implementation_plan)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            cc_data.get('title'),
            cc_data.get('requestedBy'),
            cc_data.get('changeDescription') or 'N/A',
            cc_data.get('ownerName'),
            cc_data.get('risk'),
            cc_data.get('reasonForChange') or 'N/A',
            cc_data.get('affectedAreas') or 'N/A',
            cc_data.get('implementationPlan') or 'N/A'
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
