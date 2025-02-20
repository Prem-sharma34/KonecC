
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import AudioCall from './AudioCall';

function Random() {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [partner, setPartner] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const findChatPartner = async () => {
    setIsSearching(true);
    
    // Look for available users
    const waitingUsersRef = collection(db, 'waitingUsers');
    const q = query(waitingUsersRef, 
      where('userId', '!=', currentUser.uid),
      where('status', '==', 'waiting')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // No waiting users, add self to waiting list
      const waitingDoc = await addDoc(waitingUsersRef, {
        userId: currentUser.uid,
        status: 'waiting',
        timestamp: serverTimestamp()
      });
      
      // Listen for match
      const unsubscribe = onSnapshot(doc(db, 'waitingUsers', waitingDoc.id), async (doc) => {
        if (doc.data()?.status === 'matched') {
          setIsSearching(false);
          setChatId(doc.data().chatId);
          setPartner(doc.data().partnerId);
          unsubscribe();
        }
      });
    } else {
      // Found a partner
      const partnerDoc = querySnapshot.docs[0];
      const chatDoc = await addDoc(collection(db, 'chats'), {
        users: [currentUser.uid, partnerDoc.data().userId],
        timestamp: serverTimestamp()
      });
      
      // Update partner's waiting document
      await updateDoc(doc(db, 'waitingUsers', partnerDoc.id), {
        status: 'matched',
        chatId: chatDoc.id,
        partnerId: currentUser.uid
      });
      
      setIsSearching(false);
      setChatId(chatDoc.id);
      setPartner(partnerDoc.data().userId);
    }
  };

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
      {!chatId && !isSearching && (
        <button 
          onClick={findChatPartner}
          style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
        >
          Find Someone to Chat
        </button>
      )}
      {isSearching && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          Searching for a chat partner...
        </div>
      )}
      {chatId && (
        <>
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
          {!isInCall && (
            <button 
              onClick={() => setIsInCall(true)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                marginTop: '20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              Start Audio Call
            </button>
          )}
        </>
      )}
      {isInCall && (
        <AudioCall 
          partner={partner} 
          onEndCall={() => setIsInCall(false)}
        />
      )}
    </div>
  );
}

export default Random;
