
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';

function Messages() {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, 'friends'),
        where('userId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setFriends(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });

      if (location.state?.friendId) {
        const friend = {
          friendId: location.state.friendId,
          friendName: location.state.friendName
        };
        setSelectedFriend(friend);
      }

      return () => unsubscribe();
    }
  }, [currentUser, location]);

  useEffect(() => {
    if (selectedFriend) {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('users', 'array-contains', currentUser.uid),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = [];
        snapshot.docs.forEach((doc) => {
          const messageData = doc.data();
          if ((messageData.from === currentUser.uid && messageData.to === selectedFriend.friendId) ||
              (messageData.from === selectedFriend.friendId && messageData.to === currentUser.uid)) {
            newMessages.push({
              id: doc.id,
              ...messageData
            });
            
            // Mark received messages as read
            if (messageData.to === currentUser.uid && !messageData.read) {
              updateDoc(doc.ref, { read: true });
            }
          }
        });
        setMessages(newMessages);
      });

      return () => unsubscribe();
    }
  }, [selectedFriend, currentUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedFriend) {
      try {
        const messageData = {
          text: newMessage,
          from: currentUser.uid,
          to: selectedFriend.friendId,
          users: [currentUser.uid, selectedFriend.friendId],
          timestamp: serverTimestamp(),
          read: false
        };
        
        await addDoc(collection(db, 'messages'), messageData);
        setNewMessage('');
        setShowEmojiPicker(false);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '20px', overflowY: 'auto' }}>
        <h2>Friends</h2>
        {friends.map(friend => (
          <div
            key={friend.id}
            onClick={() => setSelectedFriend(friend)}
            style={{
              padding: '10px',
              cursor: 'pointer',
              background: selectedFriend?.friendId === friend.friendId ? '#e9ecef' : 'white',
              borderRadius: '5px',
              marginBottom: '5px'
            }}
          >
            {friend.friendName}
          </div>
        ))}
      </div>
      
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        {selectedFriend ? (
          <>
            <h2 style={{ marginBottom: '20px' }}>Chat with {selectedFriend.friendName}</h2>
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '10px',
              marginBottom: '20px'
            }}>
              {messages.map(message => (
                <div
                  key={message.id}
                  style={{
                    textAlign: message.from === currentUser.uid ? 'right' : 'left',
                    margin: '5px'
                  }}
                >
                  <span style={{
                    background: message.from === currentUser.uid ? '#007bff' : '#e9ecef',
                    color: message.from === currentUser.uid ? 'white' : 'black',
                    padding: '8px 15px',
                    borderRadius: '20px',
                    display: 'inline-block',
                    maxWidth: '70%',
                    wordBreak: 'break-word'
                  }}>
                    {message.text}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ position: 'relative' }}>
              {showEmojiPicker && (
                <div style={{ position: 'absolute', bottom: '100%', right: '0' }}>
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setNewMessage(prev => prev + emojiObject.emoji);
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              )}
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                  placeholder="Type a message..."
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{ 
                    padding: '8px 15px',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                >
                  😊
                </button>
                <button 
                  type="submit" 
                  style={{ 
                    padding: '8px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px'
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px',
            color: '#666'
          }}>
            Select a friend to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
