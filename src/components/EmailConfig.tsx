import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  Typography,
  TextField,
} from '@mui/material';

interface EmailConfigProps {
  open: boolean;
  onClose: () => void;
  nodeId: string;
}

const EmailConfig: React.FC<EmailConfigProps> = ({ open, onClose, nodeId }) => {
  const [config, setConfig] = useState({
    to: '',
    subject: '',
    body: ''
  });

  // Load saved configuration for this node if it exists
  useEffect(() => {
    const savedConfig = localStorage.getItem(`email-config-${nodeId}`);
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Error loading saved configuration:', e);
      }
    }
  }, [nodeId]);

  // Save configuration when it changes
  useEffect(() => {
    localStorage.setItem(`email-config-${nodeId}`, JSON.stringify(config));
  }, [config, nodeId]);

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
          m: { xs: 2, sm: 0 }
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
              To
            </Typography>
            <TextField
              fullWidth
              value={config.to}
              onChange={(e) => setConfig({ ...config, to: e.target.value })}
              placeholder="Enter email addresses"
              size="small"
            />
          </Box>

          <Box>
            <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
              Subject
            </Typography>
            <TextField
              fullWidth
              value={config.subject}
              onChange={(e) => setConfig({ ...config, subject: e.target.value })}
              placeholder="Enter subject"
              size="small"
            />
          </Box>

          <Box>
            <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
              Body
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={config.body}
              onChange={(e) => setConfig({ ...config, body: e.target.value })}
              placeholder="Enter email body"
            />
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default EmailConfig; 