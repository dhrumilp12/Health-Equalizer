import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Typography, Snackbar, IconButton, InputAdornment, Card, CardContent, Divider, CircularProgress, Button } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import backgroundImg from './images/logo.png'; 

// Custom Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // A cool blue shade
    },
    secondary: {
      main: '#4caf50',  // A soothing green shade
    },
    error: {
        main: '#f44336',  // Red color for errors and system messages
      },
      info: {
        main: '#2196f3',  // Blue color for user messages
      },
    background: {
      default: '#f4f4f4',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label.Mui-focused': {
            color: '#1976d2',
          },
          '& .MuiInput-underline:after': {
            borderBottomColor: '#1976d2',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#1976d2',
            },
            '&:hover fieldset': {
              borderColor: '#1976d2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
            },
          },
        },
      },
    },
  },
});


const HealthQueryComponent = () => {
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const audioChunksRef = useRef([]);
    

    // Fetch the welcome message on component mount
    useEffect(() => {
      
        setMessages([{ message: 'Welcome to the Health Assistant.Please submit your health-related questions.', sender: 'system' }]);
    }, []);

    const handleInputChange = (event) => setInput(event.target.value);
    const handleSnackbarClose = () => setOpenSnackbar(false);

    const sendMessage = async () => {
      if (!input.trim()) {
        setSnackbarMessage('Please enter a message.');
        setSnackbarSeverity('info');
        setOpenSnackbar(true);
        return;
    }
        setIsLoading(true);
        try {
            const response = await axios.post('/health_queries', { query: input }, {
                headers: { 'Content-Type': 'application/json' }
            });
            const data = response.data;
            setMessages(msgs => [...msgs, { message: input, sender: 'user' }, { message: data, sender: 'system' }]);
            setInput('');  // Clear input after sending
        } catch (error) {
            setSnackbarMessage('Failed to send message.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = () => {
        if (isRecording || isLoading) return;
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            audioChunksRef.current = [];
            const mimeType = getSupportedMimeType();
            const recorder = new MediaRecorder(stream, { mimeType });
            recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
            recorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                sendAudioQuery(audioBlob);
            };
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        }).catch(error => {
            console.error('Error accessing microphone:', error);
            setSnackbarMessage('Error starting recording.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        });
    };

    const stopRecording = () => {
        if (!mediaRecorder) return;
        mediaRecorder.stop();
        setIsRecording(false);
        setMediaRecorder(null);
    };

    const sendAudioQuery = async (audioBlob) => {
        if (audioBlob.size === 0) {
            setSnackbarMessage('Audio Blob is empty');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('audio', audioBlob);
        try {
          const response = await axios.post('/health_queries_audio', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          const { message } = response.data;
          setInput(message); // Display the transcribed message in the input field for editing or confirmation before sending
          setIsRecording(false); // Ensure recording is marked as stopped so the input can be edited
      } catch (error) {
          console.error('Error uploading audio:', error);
          setSnackbarMessage('Failed to send audio.');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
      } finally {
          setIsLoading(false); // Ensure loading is set to false to re-enable editing
      }
  };

    // Function to check supported MIME types for recording
    const getSupportedMimeType = () => {
        if (MediaRecorder.isTypeSupported('audio/webm; codecs=opus')) {
            return 'audio/webm; codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            return 'audio/mp4'; // Fallback for Safari on iOS
        } else {
            return 'audio/wav'; // Default to WAV if no other formats are supported
        }
    };

    return (
        <ThemeProvider theme={theme}>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <Card sx={{ width: '100%', maxWidth: 600, boxShadow: 3, borderRadius: 2 ,}}>
              <CardContent sx={{
                    height: '68vh',
                    overflow: 'auto',
                    position: 'relative', // Needed for positioning the pseudo-element correctly
                    padding: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    alignItems: 'flex-start',
                    '::before': { // Pseudo-element for the background with opacity
                        content: '""', // Necessary for pseudo-elements to work
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${backgroundImg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        opacity: 0.1, // Adjust opacity to your liking
                        
                    }
                    }}>  
                      {messages.map((msg, index) => (
                          <Typography key={index} align={msg.sender === 'user' ? 'right' : 'left'} sx={{
                            fontWeight: msg.sender === 'user' ? 500 : 400,
                            color: msg.sender === 'user' ? theme.palette.info.main : 'black',  // Black color for system messages for better contrast
                            backgroundColor: msg.sender === 'user' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.05)',  // Semi-transparent backgrounds to improve readability
                            borderRadius: '4px',
                            padding: '6px 12px',
                            maxWidth: '80%',
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',  // Align messages to the right for user and left for system
                            wordWrap: 'break-word',
                          }}>
                              {msg.message}
                          </Typography>
                      ))}
                  </CardContent>
                  <Divider />
                  <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Type your message here or use the mic to record"
                          value={input}
                          onChange={handleInputChange}
                          disabled={isLoading && isRecording}
                          InputProps={{
                              endAdornment: (
                                  <InputAdornment position="end">
                                      <IconButton
                                          onClick={isRecording ? stopRecording : startRecording}
                                          color="primary"
                                          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                                          size="large"
                                          edge="end"
                                          disabled={isLoading}
                                      >
                                          {isRecording ? <MicOffIcon /> : <MicIcon />}
                                      </IconButton>
                                  </InputAdornment>
                              ),
                          }}
                      />
                      <Button
                          variant="contained"
                          color="primary"
                          onClick={sendMessage}
                          disabled={isLoading || !input.trim()}
                          endIcon={!isLoading ? <SendIcon /> : <CircularProgress size={24} style={{ color: 'white' }} />}
                          sx={{ ml: 2 }}
                      >
                          Send
                      </Button>
                  </Box>
              </Card>
              <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
                  <MuiAlert elevation={6} variant="filled" onClose={handleSnackbarClose} severity={snackbarSeverity}>
                      {snackbarMessage}
                  </MuiAlert>
              </Snackbar>
          </Box>
        </ThemeProvider>
      );
  };
  
  export default HealthQueryComponent;
