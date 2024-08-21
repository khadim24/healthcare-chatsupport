"use client";
import { Box, Stack, TextField, Button } from "@mui/material";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I'm the HCSC support assistant. How can I help you today?` }
  ]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    setMessage('');
    setMessages((messages) => [
      ...messages, 
      { role: 'user', content: message }, 
      { role: 'assistant', content: " " }
    ]);

    const response = fetch('/api/chat', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);

          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text }
          ];
        });

        return reader.read().then(processText);
      });
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f0f4f8" // Light background color for the entire app
    >
      <Stack 
        direction={"column"} 
        width="500px" 
        height="700px" 
        boxShadow={3} // Add shadow to the chat window
        borderRadius={4} // Rounded corners for the chat window
        bgcolor="white" // White background for the chat window
        p={4}
        spacing={3}
      >
        <Stack 
          direction={"column"} 
          spacing={2} 
          flexGrow={1} 
          overflow="auto" 
          maxHeight="100%"
          sx={{ 
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '8px',
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              mb={1} // Add margin between messages
            >
              <Box
                bgcolor={message.role === 'assistant' ? '#673ab7' : 'teal'} // User's text bubble is light gray
                color="white"
                borderRadius={16}
                p={2}
                boxShadow={2} // Add shadow to the messages
                maxWidth="70%" // Limit the width of messages
                sx={{ 
                  wordWrap: 'break-word', // Ensure text wraps inside the bubble
                  transition: 'all 0.3s ease', // Add animation to message appearance
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack 
          direction={'row'} 
          spacing={2}
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          <TextField 
            label="Type your message..." 
            fullWidth 
            value={message}
            onChange={(e) => setMessage(e.target.value)} 
            variant="outlined"
            sx={{
              borderRadius: '20px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
          />
          <Button 
            variant="contained"
            color="primary"
            onClick={sendMessage}
            sx={{
              borderRadius: '20px',
              padding: '10px 20px',
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
