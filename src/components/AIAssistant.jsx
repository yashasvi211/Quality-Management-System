import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Lightbulb, AlertTriangle, Send } from 'lucide-react';
import './AIAssistant.css';

function AIAssistant() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const chatAreaRef = useRef(null);

    // Scroll to the bottom of the chat area when new messages are added
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // Set initial welcome messages
    useEffect(() => {
        setMessages([
            {
                type: 'ai-suggestion',
                content: 'Ask me anything about your QMS data, like "Show me all high-risk CAPAs" or "How many deviations were reported last month?"'
            },
        ]);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isAiTyping) return;

        const userMessage = { type: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsAiTyping(true);

        try {
            const response = await fetch('http://localhost:8001/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: input }),
            });

            if (!response.ok) {
                throw new Error('The AI assistant is currently unavailable.');
            }

            const data = await response.json();
            const aiMessage = { type: 'ai', content: data.response };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            const errorMessage = { type: 'ai-alert', content: error.message };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAiTyping(false);
        }
    };

    return (
        <aside className="ai-assistant-panel">
            <div className="ai-header">
                <BrainCircuit className="header-icon" />
                <h3>AI Assistant</h3>
            </div>
            <div className="ai-chat-area" ref={chatAreaRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-bubble ${msg.type}`}>
                        {msg.type === 'ai-suggestion' && <Lightbulb className="bubble-icon" />}
                        {msg.type === 'ai-alert' && <AlertTriangle className="bubble-icon alert" />}
                        {/* Use a library like 'marked' for full markdown support in a real app */}
                        <p dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }}></p>
                    </div>
                ))}
                {isAiTyping && (
                    <div className="chat-bubble ai typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                )}
            </div>
            <div className="ai-input-area">
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Ask the AI Assistant..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isAiTyping}
                    />
                    <button onClick={handleSend} title="Send" disabled={isAiTyping}>
                        <Send className="send-icon" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default AIAssistant;
