// app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: string;
  content: string;
}

export default function Chat() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('https://customerchatbot.up.railway.app/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setMessages([...messages, data.user_message, data.bot_response]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="flex flex-col h-[90vh] bg-white rounded-xl shadow-lg">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl ${
                        msg.role === 'user'
                            ? 'bg-blue-600 text-white px-6 py-4'
                            : 'bg-gray-100 text-gray-900 px-6 py-4'
                    }`}>
                      <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          className={`prose ${msg.role === 'user' ? 'prose-invert' : ''} max-w-none`}
                          components={{
                            pre: ({node, children}) => (
                                <div className="bg-gray-800 rounded-lg mt-2 mb-2">
                         <pre className="p-4 overflow-x-auto text-sm text-white">
                           {children}
                         </pre>
                                </div>
                            ),
                            code: ({node, inline, className, children, ...props}) => {
                              return inline ? (
                                  <code className="bg-gray-700 text-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                                    {children}
                                  </code>
                              ) : (
                                  <code {...props}>{children}</code>
                              )
                            }
                          }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about Crustdata APIs..."
                    className="flex-1 p-4 border rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
  );
}