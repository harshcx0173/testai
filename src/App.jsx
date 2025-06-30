import React, { useState } from 'react';
import './App.css';
import OpenAIService from './service/openai';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Routes, Route, Link } from 'react-router-dom';
import Weather from './Weather';


function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await OpenAIService.generateResponse(input);
      const aiMessage = { role: 'ai', content: res.data };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', content: 'Error: Could not get response.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <nav style={{ marginBottom: 24 }}>
        <Link to="/" style={{ marginRight: 16 }}>Chat</Link>
        <Link to="/weather">Weather</Link>
      </nav>
      <Routes>
        <Route path="/" element={
          <div>
            <h1>AI Chat App</h1>
            <div className="chat-box">
              {messages.map((msg, idx) => (
                <div key={idx} className={msg.role === 'user' ? 'user-msg' : 'ai-msg'}>
                  <b>{msg.role === 'user' ? 'You' : 'AI'}:</b> {msg.content}
                  {msg.role === 'ai' && (
                    <div>
                      {msg?.content?.split('\n\n').map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                      {msg.reasoning && (
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Reasoning</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography color="text.disabled" variant="body2">
                              {msg.reasoning.split('\n\n').map((para, idx) => (
                                <p key={idx} style={{ margin: 0 }}>{para}</p>
                              ))}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {loading && <div className="ai-msg">AI is typing...</div>}
            </div>
            <form onSubmit={sendMessage} className="input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
              />
              <button type="submit" disabled={loading || !input.trim()}>Send</button>
            </form>
          </div>
        } />
        <Route path="/weather" element={<Weather />} />
      </Routes>
    </div>
  );
}

export default App;
