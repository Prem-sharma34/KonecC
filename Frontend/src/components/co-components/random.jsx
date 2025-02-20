import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

function Random() {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null); // Assuming chatId is provided externally or through props

  useEffect(() => {
    if (chatId) {
      const q = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy('timestamp')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(
          snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      });

      return () => unsubscribe();
    }
  }, [chatId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (message.trim() && chatId) {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        text: message,
        sender: currentUser.uid,
        timestamp: serverTimestamp()
      });
      setMessage('');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h2>Random Chat</h2>
      <div style={{ 
        height: '400px', 
        border: '1px solid #ccc', 
        marginBottom: '20px',
        overflowY: 'auto',
        padding: '10px'
      }}>
        {messages.map(msg => (
          <div 
            key={msg.id}
            style={{
              textAlign: msg.sender === currentUser.uid ? 'right' : 'left',
              margin: '5px'
            }}
          >
            <span style={{
              background: msg.sender === currentUser.uid ? '#007bff' : '#e9ecef',
              color: msg.sender === currentUser.uid ? 'white' : 'black',
              padding: '5px 10px',
              borderRadius: '10px',
              display: 'inline-block'
            }}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
          placeholder="Type a message..."
        />
        <button type="submit" style={{ padding: '8px 20px' }}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Random;