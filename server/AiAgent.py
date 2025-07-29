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
import json

# --- Environment Setup ---
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")

# --- LLM Initialization ---
llm = ChatGroq(model="llama3-8b-8192", temperature=0, api_key=GROQ_API_KEY, timeout=30.0)

# --- The FastAPI instance is now named 'ai_app' ---
ai_app = FastAPI()

ai_app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RouteQuery(BaseModel):
    routing: Literal["query_planner", "conversational"] = Field(
        description="Set to 'query_planner' for questions about data, records, or summaries. Otherwise, set to 'conversational'."
    )

class SqlQuery(BaseModel):
    query: str = Field(description="A complete, executable MySQL query.")

# --- UPDATED DB SCHEMA ---
db_schema = """
1. `audit` table: (id, title, type, risk, status, auditee_name, lead_auditor, audit_date, scope, objective, members, criteria, agenda)
2. `deviation` table: (id, title, description, owner_name, risk, status, date_occurred, reported_by, impact, corrective_actions)
3. `capa` table: (id, title, owner_name, risk, status, root_cause, due_date, responsible_person, issue_description, corrective_actions, preventive_actions)
4. `change_control` table: (id, title, requested_by, owner_name, risk, status, due_date, change_description, reason_for_change, affected_areas, implementation_plan)
"""

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

def query_router(question: str):
    print("--- 🧠 AI Router ---")
    router_llm = llm.with_structured_output(RouteQuery)
    prompt = f"""You are a routing agent for a Quality Management System (QMS) assistant. Your job is to decide if a user's question can be answered from the QMS database or if it's a general conversational question.

    - If the question contains keywords like 'audit', 'deviation', 'CAPA', 'change control', 'event', 'risk', 'status', 'owner', or asks for a list, count, or summary of data, you MUST route to 'query_planner'.
    - For general questions (like 'what is QMS?'), greetings, or follow-ups that don't refer to specific database records, route to 'conversational'.

    User Question: {question}
    """
    return router_llm.invoke([HumanMessage(content=prompt)])

def query_planner(question: str):
    print("--- 🗺️ AI Query Planner ---")
    planner_llm = llm.with_structured_output(SqlQuery)
    
    # --- STRONGER PROMPT ---
    # This prompt is extremely direct and provides a template to prevent errors.
    prompt = f"""As a MySQL expert, your sole function is to generate a single, valid MySQL query based on the user's question and the provided schema. Your output must be ONLY the SQL query string. Do not include explanations or any other text.

    **Database Schema:**
    {db_schema}

    **CRITICAL INSTRUCTIONS:**
    - If the user asks for a specific type of event (e.g., "show all audits"), query ONLY that table (e.g., `SELECT * FROM audit;`).
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

    **Your Response (Query ONLY):**
    """
    result = planner_llm.invoke([HumanMessage(content=prompt)])
    print(f"--- Generated SQL: {result.query} ---")
    return result.query

def execute_sql(query: str):
    print("--- Executing SQL ---")
    connection = get_db_connection()
    if connection is None:
        return "Failed to connect to the database."
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute(query)
        result = cursor.fetchall()
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
    print("--- ✍️ AI Final Responder ---")
    prompt = f"""You are a helpful QMS assistant. Your ONLY source of information is the data provided below.
    Based on the user's question and the data from the database, provide a direct and concise answer.
    Do NOT use any external knowledge. If the data is empty, state that you could not find the record.

    **CONTEXT FOR DATA FIELDS:**
    - For `audit` records, the main person is `lead_auditor`.
    - For `deviation`, `capa`, or `change_control` records, the main person is `owner_name`.
    - When asked for "author", "owner", "lead", or "responsible person", use the appropriate field based on the record type.
    - When asked for a specific field like "risk" or "status", extract and provide only that value.

    Original Question: {question}
    Database Results:
    {results}
    """
    return llm.invoke([HumanMessage(content=prompt)]).content

# --- AI Summary Endpoint ---
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
    if not event_data or isinstance(event_data, str):
        raise HTTPException(status_code=404, detail="Event not found.")

    summary_prompt = f"""
    You are a QMS Analyst. Based on the following data for a QMS event, provide a brief, professional summary (2-3 sentences).
    Highlight the key information, such as the main issue, the risk level, and the person responsible.

    Event Data:
    {json.dumps(event_data[0], indent=2)}

    Summary:
    """
    
    summary = llm.invoke([HumanMessage(content=summary_prompt)]).content
    return {"summary": summary}

@ai_app.post("/ai-chat")
def ai_chat_endpoint(request: dict):
    question = request.get("query")
    if not question:
        raise HTTPException(status_code=400, detail="Query is missing.")

    id_pattern = re.compile(r'\b(aud|dev|cpa|chc)[\s-]?(\d+)\b', re.IGNORECASE)
    match = id_pattern.search(question)

    prefix_to_table = {
        "aud": "audit",
        "dev": "deviation",
        "cpa": "capa",
        "chc": "change_control"
    }

    if match:
        prefix = match.group(1).lower()
        numeric_id = match.group(2)
        table_name = prefix_to_table.get(prefix)

        if table_name:
            print(f"--- 🎯 Direct ID Route Found: Table '{table_name}', ID '{numeric_id}' ---")
            sql_query = f"SELECT * FROM {table_name} WHERE id = {numeric_id}"
            db_results = execute_sql(sql_query)
            final_answer = final_responder(question, db_results)
            return {"response": final_answer}

    try:
        route = query_router(question)
        if route.routing == "query_planner":
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
