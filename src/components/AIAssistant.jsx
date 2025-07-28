import React, { useState, useEffect } from 'react';
import { BrainCircuit, Lightbulb, AlertTriangle, Send } from 'lucide-react';
import './AIAssistant.css';

// Mock AI function to simulate responses
const getMockAIResponse = (query, events) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('high-risk') || lowerQuery.includes('high risk')) {
        const highRiskEvents = events.filter(e => e.risk === 'High' || e.risk === 'Medium');
        if (highRiskEvents.length > 0) {
            return `I found ${highRiskEvents.length} medium or high-risk events: ${highRiskEvents.map(e => `**${e.id}**`).join(', ')}. You should prioritize these.`;
        }
        return "There are currently no high-risk events.";
    }

    if (lowerQuery.includes('summarize') && lowerQuery.includes('open')) {
        const openEvents = events.filter(e => e.status !== 'Closed' && e.status !== 'Cancelled');
        return `There are currently **${openEvents.length} open events**. This includes ${openEvents.filter(e=>e.type === 'Deviation').length} Deviations, ${openEvents.filter(e=>e.type === 'CAPA').length} CAPAs, and ${openEvents.filter(e=>e.type === 'Audit').length} Audits.`;
    }
    
    const matchEventId = lowerQuery.match(/(dev|capa|aud)-[0-9]{4}-[0-9]{3}/);
    if (matchEventId) {
        const eventId = matchEventId[0].toUpperCase();
        if (lowerQuery.includes('next steps')) {
             return `For **${eventId}**, I suggest the following next steps: 1. Verify the investigation plan is complete. 2. Ensure all team members are assigned. 3. Confirm the due date is realistic.`;
        }
        if (lowerQuery.includes('generate') && lowerQuery.includes('notification')) {
            return `*Draft Notification for ${eventId}:*\n\nSubject: Closure of QMS Event ${eventId}\n\nDear Team,\n\nThis is to formally notify you that the QMS event **${eventId}** has been successfully closed as of ${new Date().toLocaleDateString()}.\n\nAll associated actions have been completed and verified.\n\nThank you,\nQMS System`;
        }
    }

    if (lowerQuery.includes('capa') && lowerQuery.includes('trends')) {
        return "Based on recent data, a recurring trend in CAPAs is 'Inadequate Training'. I recommend a review of the current training program for the Manufacturing department to improve effectiveness.";
    }

    return `I'm sorry, I can't answer that yet. Try asking me to "show high-risk events" or "summarize open events".`;
};


function AIAssistant() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    // Initial messages
    useEffect(() => {
        setMessages([
            {
                type: 'ai-suggestion',
                content: 'Ask me to "show high-risk events", "summarize open events", or "suggest next steps for DEV-2025-001".'
            },
            {
                type: 'ai-alert',
                content: 'Proactive Alert: CAPA-2025-012 is approaching its due date.'
            }
        ]);
    }, []);

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { type: 'user', content: input }];
        setMessages(newMessages);
        
        // Mock fetching all events to pass to the AI logic
        // In a real app, this might come from props or a Redux selector
        const allEvents = []; // This would be populated from Redux state
        const aiResponse = getMockAIResponse(input, allEvents);

        setTimeout(() => {
            setMessages([...newMessages, { type: 'ai', content: aiResponse }]);
        }, 500);

        setInput('');
    };

    return (
        <aside className="ai-assistant-panel">
            <div className="ai-header">
                <BrainCircuit className="header-icon" />
                <h3>AI Assistant</h3>
            </div>
            <div className="ai-chat-area">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-bubble ${msg.type}`}>
                        {msg.type === 'ai-suggestion' && <Lightbulb className="bubble-icon" />}
                        {msg.type === 'ai-alert' && <AlertTriangle className="bubble-icon alert" />}
                        <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }}></p>
                    </div>
                ))}
            </div>
            <div className="ai-input-area">
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Ask about QMS events..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={handleSend} title="Send">
                        <Send className="send-icon" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default AIAssistant;
