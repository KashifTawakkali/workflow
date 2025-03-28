import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
} from '@mui/material';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Add your actual authentication logic here
      // For now, we'll use a simple check
      if (email === 'admin@example.com' && password === 'password') {
        // Set authentication status
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify({ email }));
        
        // Redirect to workflows page
        navigate('/workflows');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDF7F2',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: '400px',
          borderRadius: '12px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            textAlign: 'center',
            fontWeight: 600,
            color: '#333',
          }}
        >
          Welcome Back
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
              Email
            </Typography>
            <TextField
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  '& fieldset': {
                    borderColor: '#E5E5E5',
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ mb: 1, fontSize: '14px', color: '#333' }}>
              Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  '& fieldset': {
                    borderColor: '#E5E5E5',
                  },
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mb: 2,
              py: 1.5,
              backgroundColor: '#F44336',
              borderRadius: '6px',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#D32F2F',
              },
            }}
          >
            Login
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              onClick={() => setError('Forgot password feature coming soon!')}
              sx={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '14px',
                '&:hover': {
                  color: '#333',
                },
              }}
            >
              Forgot Password?
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login; 