import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import './AIAssistant.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Gemini AI assistant. Looking for food recommendations or sports turfs in Guntur?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.askGemini(userMessage);
      setMessages(prev => [...prev, { text: response.answer, sender: 'ai' }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Oops, my AI brain is taking a break. Try again later!", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`ai-wrapper ${isOpen ? 'open' : ''}`}>
      {/* Floating Button */}
      <button 
        className="ai-fab" 
        onClick={() => setIsOpen(!isOpen)}
        title="Ask Gemini AI"
      >
        {isOpen ? '✕' : '✨'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window card anim-slide-up">
          <div className="ai-chat-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <div className="ai-avatar">✨</div>
              <div>
                <strong style={{display: 'block', fontSize: '0.9rem', color: '#fff'}}>QuickServe AI</strong>
                <span style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)'}}>Powered by Google Gemini</span>
              </div>
            </div>
            <button className="btn-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="ai-chat-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-msg-row ${msg.sender}`}>
                <div className="ai-msg-bubble">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="ai-msg-row ai">
                <div className="ai-msg-bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chat-footer" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask for recommendations..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="ai-input"
            />
            <button type="submit" className="ai-send-btn" disabled={!input.trim() || isTyping}>
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
