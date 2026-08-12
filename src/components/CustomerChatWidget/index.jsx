import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { aiService } from '../../services/aiService';

const starterQuestions = [
  'How do I reset my password?',
  'Can I request a refund?',
  'How do I request VPN access?',
  'Why is my internet slow?',
  'How do I submit a support ticket?',
  'What is the status of my ticket?',
  'How do I contact my manager for approval?',
  'How do I update my account details?',
];



export default function CustomerChatWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      from: 'bot',
      text: 'Hi! I can search the support knowledge base and help with common questions.',
    },
  ]);
  const [typing, setTyping] = useState(false);

  const ask = async (value = question) => {
    const text = value.trim();
    if (!text || typing) return;
    setQuestion('');
    setMessages((items) => [...items, { id: `q-${Date.now()}`, from: 'customer', text }]);
    setTyping(true);
    const result = await aiService.answerQuestion(text);
    setMessages((items) => [...items, {
      id: `a-${Date.now()}`,
      from: 'bot',
      text: result.answer,
      source: result.source,
      needsAgent: result.needsAgent,
    }]);
    setTyping(false);
  };

  return (
    <div className={`sp-chat-widget${open ? ' is-open' : ''}`}>
      {open && (
        <section className="sp-chat-panel" aria-label="Customer support chat">
          <header className="sp-chat-header">
            <div>
              <strong>SupportPilot Assistant</strong>
              <span><i /> Knowledge base answers</span>
            </div>
            <button type="button" className="sp-chat-close" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </header>
          <div className="sp-chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`sp-chat-message ${message.from}`}>
                <p>{message.text}</p>
                {message.source && <small>Source: {message.source}</small>}
                {message.needsAgent && (
                  <Link to="/login" className="sp-chat-action">Create a ticket or contact support →</Link>
                )}
              </div>
            ))}
            {typing && <div className="sp-chat-message bot"><p className="sp-chat-typing">Searching the knowledge base…</p></div>}
          </div>
          <div className="sp-chat-starters">
            {starterQuestions.map((item) => <button key={item} type="button" onClick={() => ask(item)}>{item}</button>)}
          </div>
          <form className="sp-chat-form" onSubmit={(event) => { event.preventDefault(); ask(); }}>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a support question…" aria-label="Ask a support question" />
            <button type="submit" aria-label="Send message" disabled={!question.trim() || typing}>↑</button>
          </form>
        </section>
      )}
      <button type="button" className="sp-chat-launcher" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close support chat' : 'Open support chat'}>
        <span>{open ? '×' : '✦'}</span>
        {!open && <b>Need help?</b>}
      </button>
    </div>
  );
}