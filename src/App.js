import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const messageList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(messageList);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      const docRef = await addDoc(collection(db, 'messages'), {
        text: newMessage,
        createdAt: new Date()
      });
      const newDoc = {
        id: docRef.id,
        text: newMessage,
        createdAt: new Date()
      };
      setMessages([newDoc, ...messages]);
      setNewMessage('');
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>TrueFans App</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
        <div className="messages">
          {messages.map((message) => (
            <div key={message.id} className="message">
              <p>{message.text}</p>
              <small>{message.createdAt?.toDate().toLocaleString()}</small>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
