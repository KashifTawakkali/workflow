import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface PasswordPopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  email: string;
}

const PasswordPopup = ({ open, onClose, onSubmit, email }: PasswordPopupProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    onSubmit(password);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '400px',
          borderRadius: '16px',
          padding: '16px',
        }
      }}
    >
      <DialogTitle>
        <Typography
          sx={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#333',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Set Your Password
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1, color: '#666', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
            Email
          </Typography>
          <TextField
            fullWidth
            value={email}
            disabled
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '48px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
              }
            }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1, color: '#666', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
            Password
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePassword}
                    edge="end"
                    sx={{
                      color: '#666',
                      '&:hover': {
                        color: '#333',
                      },
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '48px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                '& fieldset': {
                  borderColor: '#E5E5E5',
                },
                '&:hover fieldset': {
                  borderColor: '#999',
                },
                '& .MuiInputAdornment-root': {
                  marginRight: '4px',
                },
              }
            }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1, color: '#666', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
            Confirm Password
          </Typography>
          <TextField
            fullWidth
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleToggleConfirmPassword}
                    edge="end"
                    sx={{
                      color: '#666',
                      '&:hover': {
                        color: '#333',
                      },
                    }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '48px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                '& fieldset': {
                  borderColor: '#E5E5E5',
                },
                '&:hover fieldset': {
                  borderColor: '#999',
                },
                '& .MuiInputAdornment-root': {
                  marginRight: '4px',
                },
              }
            }}
          />
        </Box>
        {error && (
          <Typography color="error" sx={{ mt: 1, fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: '16px' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#666',
            textTransform: 'none',
            fontFamily: "'Inter', sans-serif",
            '&:hover': {
              backgroundColor: 'transparent',
              color: '#333',
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{
            bgcolor: '#f44336',
            color: 'white',
            textTransform: 'none',
            fontFamily: "'Inter', sans-serif",
            '&:hover': {
              bgcolor: '#d32f2f'
            },
            px: 3,
            py: 1,
            borderRadius: '8px',
          }}
        >
          Set Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordPopup; 