from fastapi import FastAPI, HTTPException
import mysql.connector
from mysql.connector import Error
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from pydantic import BaseModel

# --- Pydantic model for the status update request ---
class StatusUpdate(BaseModel):
    status: str

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

# --- NEW: Universal Endpoint to Update Event Status ---
@app.patch("/event/{event_type}/{event_id}/status")
def update_event_status(event_type: str, event_id: int, status_update: StatusUpdate):
    # Map the URL parameter to a valid table name to prevent SQL injection
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
        # CORRECTED: This query now selects the 'status' column from each table
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

# --- ADDED: Individual GET endpoints for detail pages ---

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