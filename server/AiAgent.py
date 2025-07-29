from fastapi import FastAPI, HTTPException
import mysql.connector
from mysql.connector import Error
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
import os
from typing import Literal
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage
import re

# --- Environment Setup ---
# It's recommended to use environment variables for API keys in production.
# For local development, you can hardcode it like this.
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")

# --- LLM Initialization ---
llm = ChatGroq(model="llama3-8b-8192", temperature=0, api_key=GROQ_API_KEY, timeout=30.0)

# --- The FastAPI instance ---
ai_app = FastAPI()

# --- CORS Middleware ---
# Allows the React frontend (running on localhost:5173) to communicate with this backend.
ai_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # The origin of your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Structured LLM Output ---

# CORRECTED: Simplified routing model to a boolean decision.
class QueryDecision(BaseModel):
    """A model to decide whether a SQL query is needed."""
    generate_query: bool = Field(description="Set to True if the question requires database access, False for conversational chat.")

class SqlQuery(BaseModel):
    """A model to hold a complete, executable MySQL query."""
    query: str = Field(description="A complete, executable MySQL query.")

# --- Database Schema Definition ---
db_schema = """
1. `audit` table: (id, title, type, risk, status, auditee_name, lead_auditor, audit_date)
2. `deviation` table: (id, title, description, owner_name, risk, status, date_occurred)
3. `capa` table: (id, title, owner_name, risk, status, root_cause, due_date)
4. `change_control` table: (id, title, requested_by, owner_name, risk, status, due_date)
"""

# --- Database Helper Functions ---
def get_db_connection():
    """Establishes a connection to the MySQL database."""
    try:
        connection = mysql.connector.connect(
            host='localhost', 
            database='quality_management', 
            user='root', 
            password='00000000' # Replace with your actual MySQL password
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def execute_sql(query: str):
    """Executes a given SQL query and returns the results."""
    print(f"--- Executing SQL: {query} ---")
    connection = get_db_connection()
    if connection is None:
        return "Failed to connect to the database."
    
    cursor = connection.cursor(dictionary=True) # dictionary=True returns rows as dicts
    try:
        cursor.execute(query)
        result = cursor.fetchall()
        # Convert date objects to ISO format strings for JSON serialization
        for row in result:
            for key, value in row.items():
                if isinstance(value, date):
                    row[key] = value.isoformat()
        return result
    except Error as e:
        print(f"Database error: {e}")
        return f"Database error: {e}"
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# --- AI Agent Chain Functions ---

# CORRECTED: Updated router to use the boolean QueryDecision model
def query_router(question: str) -> QueryDecision:
    """Decides if a question requires database access or is conversational."""
    print("--- 🧠 AI Router ---")
    router_llm = llm.with_structured_output(QueryDecision)
    prompt = f"""You are a routing agent. Your job is to decide if a user's question requires accessing a database.

    - If the question contains keywords like 'audit', 'deviation', 'CAPA', 'change control', 'event', 'risk', 'status', 'owner', or asks for a list, count, or summary of data, you MUST decide to generate a query.
    - For general questions (like 'what is QMS?'), greetings, or follow-ups that don't refer to specific database records, you MUST NOT generate a query.

    Based on the user's question, should you generate a SQL query?

    User Question: {question}
    """
    return router_llm.invoke([HumanMessage(content=prompt)])

def query_planner(question: str) -> str:
    """Generates a MySQL query based on the user's question."""
    print("--- 🗺️ AI Query Planner ---")
    planner_llm = llm.with_structured_output(SqlQuery)
    prompt = f"""You are a MySQL query generator. Based on the schema and user question below, generate a JSON object with a single key "query" containing the valid MySQL query.

    **Database Schema:**
    {db_schema}

    **CRITICAL INSTRUCTIONS:**
    - If a general question requires searching across all event types (e.g., "show cancelled events"), you MUST use `UNION ALL`.
    - **FOR UNION QUERIES, YOU MUST USE THIS EXACT TEMPLATE**: To ensure the column count matches, select only these columns in this order: `id`, `title`, `risk`, `status`, and a manually added `type` column.
      Example for "cancelled events":
      `(SELECT id, title, risk, status, 'Audit' as type FROM audit WHERE status = 'Cancelled')`
      `UNION ALL`
      `(SELECT id, title, risk, status, 'Deviation' as type FROM deviation WHERE status = 'Cancelled')`
      `UNION ALL`
      `(SELECT id, title, risk, status, 'CAPA' as type FROM capa WHERE status = 'Cancelled')`
      `UNION ALL`
      `(SELECT id, title, risk, status, 'Change Control' as type FROM change_control WHERE status = 'Cancelled');`

    **User Question:**
    "{question}"
    """
    result = planner_llm.invoke([HumanMessage(content=prompt)])
    print(f"--- Generated SQL: {result.query} ---")
    return result.query

def final_responder(question: str, results) -> str:
    """Generates a final, user-friendly answer based on database results."""
    print("--- ✍️ AI Final Responder ---")
    prompt = f"""You are a helpful QMS assistant. Your ONLY source of information is the data provided below.
    Based on the user's question and the data from the database, provide a direct and concise answer in a friendly tone.
    Do NOT use any external knowledge. If the data is empty or no results are found, state that you could not find the requested record(s).

    **CONTEXT FOR DATA FIELDS:**
    - For `audit` records, the main person is `lead_auditor`.
    - For `deviation`, `capa`, or `change_control` records, the main person is `owner_name`.
    - When asked for "author", "owner", "lead", or "responsible person", use the appropriate field based on the record type.

    Original Question: {question}
    Database Results:
    {results}
    """
    return llm.invoke([HumanMessage(content=prompt)]).content

# --- FastAPI Endpoint ---

@ai_app.post("/ai-chat")
def ai_chat_endpoint(request: dict):
    """Main endpoint to handle user queries."""
    question = request.get("query")
    if not question:
        raise HTTPException(status_code=400, detail="Query is missing.")

    # Optimized Route: Direct ID lookup using regex
    id_pattern = re.compile(r'\b(aud|dev|cpa|chc)[\s-]?(\d+)\b', re.IGNORECASE)
    match = id_pattern.search(question)
    
    prefix_to_table = {
        "aud": "audit", "dev": "deviation", "cpa": "capa", "chc": "change_control"
    }

    if match:
        prefix, numeric_id = match.group(1).lower(), match.group(2)
        table_name = prefix_to_table.get(prefix)
        if table_name:
            print(f"--- 🎯 Direct ID Route Found: Table '{table_name}', ID '{numeric_id}' ---")
            sql_query = f"SELECT * FROM {table_name} WHERE id = {numeric_id}"
            db_results = execute_sql(sql_query)
            final_answer = final_responder(question, db_results)
            return {"response": final_answer}

    # AI-Powered Route
    try:
        # CORRECTED: Check the boolean flag from the new router
        decision = query_router(question)
        
        if decision.generate_query:
            sql_query = query_planner(question)
            db_results = execute_sql(sql_query)
            final_answer = final_responder(question, db_results)
        else:
            print("--- 💬 Conversational Route ---")
            final_answer = llm.invoke([HumanMessage(content=question)]).content
            
        return {"response": final_answer}

    except Exception as e:
        print(f"An error occurred in the AI agent: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred while processing your request: {e}")
@ai_app.get("/event/{event_type}/{event_id}/summary")
def get_event_summary(event_type: str, event_id: int):
    table_map = {
        "audit": "audit",
        "deviation": "deviation",
        "capa": "capa",
        "change-control": "change_control"
    }
    table_name = table_map.get(event_type)
    if not table_name:
        raise HTTPException(status_code=400, detail="Invalid event type.")

    event_data = execute_sql(f"SELECT * FROM {table_name} WHERE id = {event_id}")
    # Handle DB errors or empty results
    if isinstance(event_data, str):
        raise HTTPException(status_code=500, detail=event_data)
    if not event_data or len(event_data) == 0:
        return {"summary": "No event found for the given type and ID."}

    import json
    summary_prompt = f"""
    You are a QMS Analyst. Based on the following data for a QMS event, provide a brief, professional summary (2-3 sentences).
    Highlight the key information, such as the main issue, the risk level, and the person responsible.

    Event Data:
    {json.dumps(event_data[0], indent=2)}

    Summary:
    """
    summary = llm.invoke([HumanMessage(content=summary_prompt)]).content
    return {"summary": summary}
# To run this app:
# 1. Save it as main.py
# 2. Make sure you have a MySQL database named 'quality_management' with the specified tables.
# 3. Run in your terminal: uvicorn main:ai_app --reload --port 8001
