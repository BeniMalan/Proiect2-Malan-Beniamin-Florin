
import React,{useState,useEffect} from 'react'
import stomp from 'stompjs';
import sockjs from'sockjs-client';
import { Avatar, Button, List, ListItem, ListItemAvatar, ListItemText, TextField, Typography } from '@mui/material';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    const socket = new sockjs('http://localhost:8080/ws');
    const client = stomp.over(socket);
    client.connect({}, () => {
      client.subscribe('/topic/messages', (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    });
    setStompClient(client);

    return () => {
      client.disconnect();
    };
  }, []);

  const handleNickNameChange = (e) => {
    setNickname(e.target.value);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const sendMessage = () => {
    if (message.trim()) {
      const chatMessage = {
        nickname,
        content: message
      };
      stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
      setMessage('');
    }
  };

  return (
    <div>
      <List>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            <Avatar>{msg.nickname.charAt(0)}</Avatar>
            <ListItemText
              primary={
                <Typography variant="subtitle1" gutterBottom>
                  {msg.nickname}
                </Typography>
              }
              secondary={msg.content}
            />
          </ListItem>
        ))}
      </List>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          id="standard-basic"
          label="nickname"
          variant="standard"
          value={nickname}
          onChange={handleNickNameChange}
        />
        <TextField
          id="standard-basic"
          label="message"
          variant="standard"
          value={message}
          onChange={handleMessageChange}
        />
        <Button variant="contained" onClick={sendMessage} disabled={!message.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default App;

