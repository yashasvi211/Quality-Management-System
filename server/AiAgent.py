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
# --- NEW: Import 're' for regular expression matching ---
import re

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

db_schema = """
1. `audit` table: (id, title, type, risk, auditee_name, lead_auditor, audit_date)
2. `deviation` table: (id, title, description, owner_name, risk, date_occurred)
3. `capa` table: (id, title, owner_name, risk, root_cause, due_date)
4. `change_control` table: (id, title, requested_by, owner_name, risk, due_date)
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
    prompt = f"Based on the user's question, should I query the database or is it a general conversational question?\n\nQuestion: {question}"
    return router_llm.invoke([HumanMessage(content=prompt)])

def query_planner(question: str):
    print("--- 🗺️ AI Query Planner ---")
    planner_llm = llm.with_structured_output(SqlQuery)
    
    prompt = f"""You are a MySQL expert. Your task is to generate a single, valid MySQL query to answer the user's question based on the provided database schema.

    Schema:
    {db_schema}

    **IMPORTANT INSTRUCTIONS:**
    - If the user asks a general question about events (e.g., "high-risk events", "events due this month", "show all events for owner Varun Sharma"), you MUST create a query that combines results from all four tables (`audit`, `deviation`, `capa`, `change_control`) using `UNION ALL`.
    - When using `UNION ALL`, ensure each `SELECT` statement has the same columns in the same order. For example, to get high-risk events, you would structure it like this:
      (SELECT id, title, risk, 'Audit' as type, audit_date as event_date FROM audit WHERE risk = 'High')
      UNION ALL
      (SELECT id, title, risk, 'Deviation' as type, date_occurred as event_date FROM deviation WHERE risk = 'High')
      UNION ALL
      (SELECT id, title, risk, 'CAPA' as type, due_date as event_date FROM capa WHERE risk = 'High')
      UNION ALL
      (SELECT id, title, risk, 'Change Control' as type, due_date as event_date FROM change_control WHERE risk = 'High');
    - For the `risk` column, the possible values are 'Low', 'Medium', 'High'.

    User Question: {question}

    Generate the SQL query that answers the question.
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
    prompt = f"""You are a helpful QMS assistant. Based on the user's question and the following data from the database, provide a concise, natural language answer. Format the answer nicely using markdown if needed (e.g., bullet points).

    Original Question: {question}
    Database Results:
    {results}
    """
    return llm.invoke([HumanMessage(content=prompt)]).content

@ai_app.post("/ai-chat")
def ai_chat_endpoint(request: dict):
    question = request.get("query")
    if not question:
        raise HTTPException(status_code=400, detail="Query is missing.")

    # --- NEW: Rule-based routing for specific event IDs ---
    id_pattern = re.compile(r'\b(aud|dev|cpa|chc)-(\d+)\b', re.IGNORECASE)
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
            # Construct a direct, reliable SQL query
            sql_query = f"SELECT * FROM {table_name} WHERE id = {numeric_id}"
            db_results = execute_sql(sql_query)
            final_answer = final_responder(question, db_results)
            return {"response": final_answer}
    # --- End of new logic ---

    # If no specific ID was found, proceed with the general AI routing
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
