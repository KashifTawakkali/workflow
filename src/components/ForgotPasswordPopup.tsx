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
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';

interface ForgotPasswordPopupProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPasswordPopup = ({ open, onClose }: ForgotPasswordPopupProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          width: {
            xs: '100%',
            sm: '400px'
          },
          height: {
            xs: '100%',
            sm: 'auto'
          },
          borderRadius: {
            xs: 0,
            sm: '16px'
          },
          padding: {
            xs: '16px',
            sm: '24px'
          },
          margin: {
            xs: 0,
            sm: '16px'
          }
        }
      }}
    >
      <DialogTitle>
        <Typography
          sx={{
            fontSize: {
              xs: '20px',
              sm: '24px'
            },
            fontWeight: 600,
            color: '#333',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Reset Password
        </Typography>
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Alert 
            severity="success"
            sx={{ 
              mb: 2,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Password reset link has been sent to your email address. Please check your inbox.
          </Alert>
        ) : (
          <>
            <Typography 
              sx={{ 
                mb: 3,
                color: '#666',
                fontSize: {
                  xs: '14px',
                  sm: '14px'
                },
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ 
                mb: 1, 
                color: '#666', 
                fontSize: '14px', 
                fontFamily: "'Inter', sans-serif" 
              }}>
                Email
              </Typography>
              <TextField
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: {
                      xs: '44px',
                      sm: '48px'
                    },
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
                  }
                }}
              />
            </Box>
            {error && (
              <Typography 
                color="error" 
                sx={{ 
                  mt: 1,
                  fontSize: '14px',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {error}
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ 
        padding: {
          xs: '16px',
          sm: '24px'
        },
        flexDirection: {
          xs: 'column',
          sm: 'row'
        },
        gap: {
          xs: 2,
          sm: 1
        }
      }}>
        <Button
          onClick={handleClose}
          fullWidth={isMobile}
          sx={{
            color: '#666',
            textTransform: 'none',
            fontFamily: "'Inter', sans-serif",
            order: {
              xs: 2,
              sm: 1
            },
            '&:hover': {
              backgroundColor: 'transparent',
              color: '#333',
            }
          }}
        >
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            fullWidth={isMobile}
            sx={{
              bgcolor: '#f44336',
              color: 'white',
              textTransform: 'none',
              fontFamily: "'Inter', sans-serif",
              order: {
                xs: 1,
                sm: 2
              },
              '&:hover': {
                bgcolor: '#d32f2f'
              },
              '&.Mui-disabled': {
                bgcolor: '#ffcdd2',
              },
              px: 3,
              py: 1,
              borderRadius: '8px',
              minWidth: {
                xs: '100%',
                sm: '120px'
              },
            }}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordPopup; 