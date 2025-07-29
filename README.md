# AI-Powered Quality Management System (QMS)

This is a comprehensive, web-based Quality Management System designed to track and manage key quality events within a life sciences or manufacturing organization. The system features a powerful, database-aware AI assistant that can answer natural language questions, provide summaries, and offer insights into your quality data.

## Technology Stack

This project is built with a modern, separated frontend and backend architecture to ensure scalability and maintainability.

### Frontend (Client-Side)

| Icon | Technology | Description |
| :--: | :--- | :--- |
| ⚛️ | **React** | A declarative JavaScript library for building dynamic and responsive user interfaces. |
| 🔄 | **Redux** | Used for predictable state management across the application. |
| ✨ | **Lucide React** | Provides a clean and consistent set of icons used throughout the UI. |

### Backend (Server-Side)

| Icon | Technology | Description |
| :--: | :--- | :--- |
| 🚀 | **FastAPI** | A high-performance Python web framework for building the core application and AI agent APIs. |
| 🐬 | **MySQL** | A robust and reliable relational database used to store all QMS event data. |
| 🧠 | **LangChain & Groq** | The core of our AI, using LangChain to structure interactions with the high-speed Llama 3 model on Groq. |

---

## How to Set Up and Run the Application

### Prerequisites
* Python 3.8+
* Node.js and npm
* A running MySQL server

### 1. Backend Setup

First, set up your database and the two Python backend services.

1.  **Create the Database:**
    * Log in to your MySQL server and create a database named `quality_management`.
    * Run all the `ALTER TABLE` and `UPDATE` scripts provided previously to create your tables (`audit`, `capa`, `deviation`, `change_control`) and populate them with sample data.

2.  **Database Schema:**
    Your database should have the following table structures:

    **`audit` table**
    ```sql
    +-----------------+-------------------------------------------------------+
    | Field           | Type                                                  |
    +-----------------+-------------------------------------------------------+
    | id              | int                                                   |
    | title           | varchar(255)                                          |
    | type            | varchar(50)                                           |
    | risk            | enum('None','Low','Medium','High')                    |
    | status          | enum('Planned','In Progress','Completed','Cancelled') |
    | scope           | text                                                  |
    | objective       | text                                                  |
    | auditee_name    | varchar(255)                                          |
    | site_location   | varchar(255)                                          |
    | country         | varchar(100)                                          |
    | primary_contact | varchar(255)                                          |
    | contact_email   | varchar(255)                                          |
    | audit_date      | date                                                  |
    | lead_auditor    | varchar(255)                                          |
    | members         | text                                                  |
    | criteria        | text                                                  |
    | agenda          | text                                                  |
    +-----------------+-------------------------------------------------------+
    ```

    **`capa` table**
    ```sql
    +--------------------+-------------------------------------------------------+
    | Field              | Type                                                  |
    +--------------------+-------------------------------------------------------+
    | id                 | int                                                   |
    | title              | varchar(255)                                          |
    | responsible_person | varchar(255)                                          |
    | owner_name         | varchar(255)                                          |
    | issue_description  | text                                                  |
    | risk               | enum('None','Low','Medium','High')                    |
    | status             | enum('Planned','In Progress','Completed','Cancelled') |
    | root_cause         | text                                                  |
    | corrective_actions | text                                                  |
    | preventive_actions | text                                                  |
    | due_date           | date                                                  |
    +--------------------+-------------------------------------------------------+
    ```

    **`deviation` table**
    ```sql
    +--------------------+-------------------------------------------------------+
    | Field              | Type                                                  |
    +--------------------+-------------------------------------------------------+
    | id                 | int                                                   |
    | title              | varchar(255)                                          |
    | date_occurred      | date                                                  |
    | description        | text                                                  |
    | owner_name         | varchar(255)                                          |
    | risk               | enum('None','Low','Medium','High')                    |
    | status             | enum('Planned','In Progress','Completed','Cancelled') |
    | reported_by        | varchar(255)                                          |
    | impact             | text                                                  |
    | corrective_actions | text                                                  |
    +--------------------+-------------------------------------------------------+
    ```

    **`change_control` table**
    ```sql
    +---------------------+-------------------------------------------------------+
    | Field               | Type                                                  |
    +---------------------+-------------------------------------------------------+
    | id                  | int                                                   |
    | title               | varchar(255)                                          |
    | requested_by        | varchar(255)                                          |
    | change_description  | text                                                  |
    | owner_name          | varchar(255)                                          |
    | risk                | enum('None','Low','Medium','High')                    |
    | status              | enum('Planned','In Progress','Completed','Cancelled') |
    | reason_for_change   | text                                                  |
    | affected_areas      | text                                                  |
    | implementation_plan | text                                                  |
    | due_date            | date                                                  |
    +---------------------+-------------------------------------------------------+
    ```

3.  **Set Up a Virtual Environment (Recommended):**
    Navigate to the `server` directory in your terminal.
    ```bash
    # Create the virtual environment
    python3 -m venv venv

    # Activate it
    source venv/bin/activate
    ```

4.  **Install Python Dependencies:**
    With your virtual environment active, install all required packages.
    ```bash
    pip install fastapi "uvicorn[standard]" "mysql-connector-python[caching]" langchain-groq pydantic
    ```

5.  **Run the Backend Services:**
    You need to run the main application and the AI agent simultaneously in **two separate terminals**.

    * **In Terminal 1 (Main App):**
        ```bash
        # (Make sure your venv is active)
        uvicorn main:app --reload --port 8000
        ```
    * **In Terminal 2 (AI Agent):**
        ```bash
        # (Make sure your venv is active)
        uvicorn AiAgent:ai_app --reload --port 8001
        ```

### 2. Frontend Setup

1.  **Navigate to the client directory:**
    Open a new terminal and navigate to your frontend project folder.

2.  **Install Node Modules:**
    ```bash
    npm install
    ```

3.  **Run the React App:**
    ```bash
    npm run dev
    ```
    Your application should now be running and accessible at `http://localhost:5173`.

---

## Key Features

This application provides a robust set of tools for managing quality events.

### 1. Detailed Event Screens
* **Comprehensive View:** Every event (Audit, CAPA, etc.) has its own dedicated detail page that displays all relevant information from the database.
* **Interactive Status Updates:** You can change the status of any event directly from its detail page using a dropdown menu. The change is saved to the database in real-time.

### 2. AI-Generated Summaries
* **Quick Insights:** Each detail page includes an "AI Summary" section. When you open a page, the system sends the event's data to the AI agent, which generates a concise, professional summary of the key information.

### 3. Database-Aware AI Assistant
The AI assistant is the core intelligent feature of this application. It can understand and respond to a wide range of natural language queries.

* **Ask Database-Related Questions:**
    You can ask the AI to retrieve specific information from the database. It understands the relationships between your tables and can generate its own SQL queries to find the answers.
    * **Example:** "How many deviation events do we have?"
    * **Example:** "List all events with 'High' risk."

* **Filter and Find Events:**
    The AI can perform complex filtering that would typically require multiple clicks in a traditional UI.
    * **Example:** "Show me all planned audits for the Baddi site."
    * **Example:** "Which events are owned by Rajesh Kumar?"

* **Get Specific Details:**
    The AI can parse event IDs (e.g., `aud-1`, `cpa 2`) to fetch and summarize specific records directly from the chat interface.
    * **Example:** "What is the root cause for cpa-1?"
    * **Example:** "Tell me about dev-5."

* **Provide Suggestions and Explanations:**
    The AI can also answer general knowledge questions related to Quality Management, acting as a helpful co-pilot.
    * **Example:** "What is the purpose of a CAPA?"
    * **Example:** "What should be the next steps for an 'In Progress' deviation?"
