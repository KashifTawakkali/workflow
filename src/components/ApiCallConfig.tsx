import React, { useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import axios from 'axios';

interface ApiCallConfigProps {
  open: boolean;
  onClose: () => void;
  nodeId: string;
  onExecutionComplete?: (result: {
    status: 'passed' | 'failed';
    method: string;
    url: string;
    headers: string;
    body: string;
    response?: any;
    error?: string;
  }) => void;
}

const ApiCallConfig: React.FC<ApiCallConfigProps> = ({ open, onClose, nodeId, onExecutionComplete }) => {
  const [config, setConfig] = useState({
    method: 'GET',
    url: '',
    headers: '',
    body: ''
  });
  const [executing, setExecuting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleExecute = async () => {
    if (!config.url) {
      setSnackbar({
        open: true,
        message: 'Please enter a URL',
        severity: 'error'
      });
      return;
    }

    setExecuting(true);
    try {
      let headers = {};
      try {
        headers = config.headers ? JSON.parse(config.headers) : {};
      } catch (e) {
        throw new Error('Invalid headers format. Please use valid JSON.');
      }

      let data = null;
      if (config.body) {
        try {
          data = JSON.parse(config.body);
        } catch (e) {
          throw new Error('Invalid body format. Please use valid JSON.');
        }
      }

      const response = await axios({
        method: config.method.toLowerCase(),
        url: config.url,
        headers,
        data,
      });

      setSnackbar({
        open: true,
        message: 'API call executed successfully',
        severity: 'success'
      });

      if (onExecutionComplete) {
        onExecutionComplete({
          status: 'passed',
          ...config,
          response: response.data
        });
      }
    } catch (error) {
      console.error('API call failed:', error);
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'API call failed',
        severity: 'error'
      });

      if (onExecutionComplete) {
        onExecutionComplete({
          status: 'failed',
          ...config,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          width: { xs: '90%', sm: '480px' },
          p: 0,
          m: { xs: 2, sm: 0 },
          position: 'relative',
          overflow: 'visible'
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
          pt: 4
        }
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: -32,
          top: 24,
          width: '32px',
          height: '120px',
          backgroundColor: '#FF4B4B',
          color: '#FFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px 0 0 4px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px',
          fontWeight: 500,
          writingMode: 'vertical-lr',
          transform: 'rotate(180deg)',
          boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.1)',
          zIndex: 1,
        }}
      >
        Configuration
      </Box>

      <Box sx={{ pl: 2, pr: 3, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography sx={{ 
              mb: 1, 
              fontSize: '14px', 
              color: '#333',
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
            }}>
              Method
            </Typography>
            <TextField
              select
              fullWidth
              value={config.method}
              onChange={(e) => setConfig({ ...config, method: e.target.value })}
              size="small"
              placeholder="Type here.."
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E5E5E5',
                  },
                  '&:hover fieldset': {
                    borderColor: '#999',
                  },
                  '& input::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                },
              }}
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </TextField>
          </Box>

          <Box>
            <Typography sx={{ 
              mb: 1, 
              fontSize: '14px', 
              color: '#333',
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
            }}>
              URL
            </Typography>
            <TextField
              fullWidth
              placeholder="Type here.."
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E5E5E5',
                  },
                  '&:hover fieldset': {
                    borderColor: '#999',
                  },
                  '& input::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ 
              mb: 1, 
              fontSize: '14px', 
              color: '#333',
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
            }}>
              Headers
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter headers in JSON format"
              value={config.headers}
              onChange={(e) => setConfig({ ...config, headers: e.target.value })}
              size="small"
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E5E5E5',
                  },
                  '&:hover fieldset': {
                    borderColor: '#999',
                  },
                  '& input::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ 
              mb: 1, 
              fontSize: '14px', 
              color: '#333',
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
            }}>
              Body
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter body in JSON format"
              value={config.body}
              onChange={(e) => setConfig({ ...config, body: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#E5E5E5',
                  },
                  '&:hover fieldset': {
                    borderColor: '#999',
                  },
                  '& textarea::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif",
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              onClick={onClose}
              sx={{
                color: '#666',
                textTransform: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#333',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecute}
              disabled={executing}
              variant="contained"
              sx={{
                bgcolor: '#1A1A1A',
                color: 'white',
                textTransform: 'none',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '6px',
                '&:hover': {
                  bgcolor: '#000'
                }
              }}
            >
              {executing ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : (
                'Execute'
              )}
            </Button>
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ApiCallConfig; 