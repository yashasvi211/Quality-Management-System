from fastapi import FastAPI, HTTPException
import mysql.connector
from mysql.connector import Error
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
import os
from typing import Literal
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field

# --- Environment Setup ---
# It's best practice to set this in your environment, but we'll use a fallback.
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")

# --- LLM Initialization ---
# Using Gemini 1.5 Flash via Groq for speed and intelligence
llm = ChatGroq(model="gemini-flash", temperature=0, api_key=GROQ_API_KEY, timeout=30.0)

# --- Pydantic Models for Structured Output ---
class RouteQuery(BaseModel):
    """Decide whether to answer the user's question by querying the database or by having a conversation."""
    routing: Literal["query_planner", "conversational"] = Field(
        description="Set to 'query_planner' for questions about data, records, or summaries. Otherwise, set to 'conversational'."
    )

class SqlQuery(BaseModel):
    """A valid MySQL query that can be executed on the database."""
    query: str = Field(description="A complete, executable MySQL query.")

# --- Database Schema for the AI ---
db_schema = """
Here are the schemas for the tables in the Quality Management System (QMS) database.
You can join them if necessary to answer complex questions.

1. `audit` table: Stores records of internal and external audits.
   - `id` (INT, Primary Key): Unique identifier for the audit.
   - `title` (VARCHAR): The title of the audit.
   - `type` (VARCHAR): The type of audit (e.g., 'Internal', 'Supplier/Vendor', 'Regulatory').
   - `risk` (ENUM: 'None', 'Low', 'Medium', 'High'): The risk level associated with the audit.
   - `auditee_name` (VARCHAR): The name of the entity being audited.
   - `lead_auditor` (VARCHAR): The name of the lead auditor.
   - `audit_date` (DATE): The date the audit is scheduled for.

2. `deviation` table: Stores records of deviations from standard procedures.
   - `id` (INT, Primary Key): Unique identifier for the deviation.
   - `title` (VARCHAR): A brief title for the deviation event.
   - `description` (TEXT): A detailed description of what happened.
   - `owner_name` (VARCHAR): The person or department head responsible for the area.
   - `risk` (ENUM: 'None', 'Low', 'Medium', 'High'): The assessed risk of the deviation.
   - `date_occurred` (DATE): The date the deviation happened.

3. `capa` table: Stores Corrective and Preventive Action records.
   - `id` (INT, Primary Key): Unique identifier for the CAPA.
   - `title` (VARCHAR): The title of the CAPA.
   - `owner_name` (VARCHAR): The person responsible for ensuring the CAPA is completed.
   - `risk` (ENUM: 'None', 'Low', 'Medium', 'High'): The risk level of the issue being addressed.
   - `root_cause` (TEXT): The identified root cause of the issue.
   - `due_date` (DATE): The date the CAPA must be completed by.

4. `change_control` table: Manages changes to processes or systems.
   - `id` (INT, Primary Key): Unique identifier for the change control.
   - `title` (VARCHAR): The title of the proposed change.
   - `requested_by` (VARCHAR): The person who requested the change.
   - `owner_name` (VARCHAR): The person responsible for implementing the change.
   - `risk` (ENUM: 'None', 'Low', 'Medium', 'High'): The risk associated with the change.
   - `due_date` (DATE): The target completion date for the change.
"""

# --- Existing App and DB Functions (no changes needed) ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost', database='quality_management', user='root', password='88888888'
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# --- AI Agent Logic ---

def query_router(question: str):
    """Decides the best path to answer the user's question."""
    print("--- 🧠 AI Router ---")
    router_llm = llm.with_structured_output(RouteQuery)
    prompt = f"Based on the user's question, should I query the database or is it a general conversational question?\n\nQuestion: {question}"
    return router_llm.invoke(prompt)

def query_planner(question: str):
    """Generates a SQL query based on the user's question and schema."""
    print("--- 🗺️ AI Query Planner ---")
    planner_llm = llm.with_structured_output(SqlQuery)
    prompt = f"You are a MySQL expert. Given the database schema below and a user question, generate a single, valid MySQL query to answer it. Respond ONLY with the SQL query.\n\nSchema:\n{db_schema}\n\nUser Question: {question}"
    result = planner_llm.invoke(prompt)
    print(f"--- 쿼리 생성됨: {result.query} ---")
    return result.query

def execute_sql(query: str):
    """Executes the generated SQL query and returns the results."""
    print("--- Executing SQL ---")
    connection = get_db_connection()
    if connection is None:
        return "Failed to connect to the database."
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(query)
        result = cursor.fetchall()
        # Convert date objects to strings for JSON
        for row in result:
            for key, value in row.items():
                if isinstance(value, date):
                    row[key] = value.isoformat()
        return result
    except Error as e:
        return f"Database error: {e}"
    finally:
        cursor.close()
        connection.close()

def final_responder(question: str, results):
    """Generates a final, user-friendly response based on the query results."""
    print("--- ✍️ AI Final Responder ---")
    prompt = f"""You are a helpful QMS assistant. Based on the user's question and the following data from the database, provide a concise, natural language answer. Format the answer nicely using markdown if needed (e.g., bullet points).

    Original Question: {question}
    Database Results:
    {results}
    """
    return llm.invoke(prompt).content

# --- The New AI Chat Endpoint ---

@app.post("/ai-chat")
def ai_chat_endpoint(request: dict):
    question = request.get("query")
    if not question:
        raise HTTPException(status_code=400, detail="Query is missing.")

    try:
        # 1. Decide the route
        route = query_router(question)

        # 2. Follow the route
        if route.routing == "query_planner":
            # 2a. Plan and execute a query
            sql_query = query_planner(question)
            db_results = execute_sql(sql_query)
            final_answer = final_responder(question, db_results)
        else: # "conversational"
            # 2b. Have a general conversation
            print("--- 💬 Conversational Route ---")
            final_answer = llm.invoke(question).content
            
        return {"response": final_answer}

    except Exception as e:
        print(f"An error occurred in the AI agent: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request.")

# ... (your other endpoints like /events, /audit/{id}, etc. can remain here)
