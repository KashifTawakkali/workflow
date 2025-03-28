import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface EmailConfigProps {
  open: boolean;
  onClose: () => void;
  nodeId: string;
}

const EmailConfig: React.FC<EmailConfigProps> = ({ open, onClose, nodeId }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          maxWidth: '600px'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 3,
        borderBottom: '1px solid #E5E5E5'
      }}>
        <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 500 }}>
          Configuration
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
            Email
          </Typography>
          <TextField
            fullWidth
            placeholder="Type here.."
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#E5E5E5',
                },
              },
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EmailConfig; 