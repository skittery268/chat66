import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function Chat() {
  const { user } = useAuth();
  const { activeGroup, messages, loadingMessages, sendMessage, deleteMessage } = useChat();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeGroup) {
    return (
      <div className="chat-empty">
        <p>Select a group to start chatting</p>
      </div>
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(content.trim());
      setContent('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId);
    } catch (err) {
      alert(err.message);
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat">
      <div className="chat-header">
        <h3>{activeGroup.title}</h3>
        <span className="member-count">{activeGroup.members?.length || 0} members</span>
      </div>

      <div className="chat-messages">
        {loadingMessages ? (
          <p className="loading">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="empty">No messages yet. Say something!</p>
        ) : (
          messages.map((msg) => {
            const senderId = msg.sender?._id || msg.sender;
            const isOwn = senderId === user?._id;
            return (
              <div key={msg._id} className={`message ${isOwn ? 'own' : ''}`}>
                <div className="message-bubble">
                  {!isOwn && msg.sender?.fullname && (
                    <span className="message-sender">{msg.sender.fullname}</span>
                  )}
                  <p className="message-content">{msg.content}</p>
                  <span className="message-time">
                    {msg.createdAt && formatTime(msg.createdAt)}
                  </span>
                  {isOwn && (
                    <button
                      className="btn-delete-msg"
                      onClick={() => handleDelete(msg._id)}
                      title="Delete message"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit" disabled={sending}>
          Send
        </button>
      </form>
    </div>
  );
}
