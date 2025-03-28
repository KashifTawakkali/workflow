import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Alert,
  Paper,
} from '@mui/material';
import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup, updatePassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import bgImage from '../../assets/bg-img.png';
import GoogleIcon from '../assets/google.svg';
import FacebookIcon from '../assets/facebook.svg';
import AppleIcon from '../assets/apple.svg';
import logo from '../../assets/Group_779.png';
import bgOverlay from '../assets/bg-overlay.png';
import PasswordPopup from '../components/PasswordPopup';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ForgotPasswordPopup from '../components/ForgotPasswordPopup';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [socialLoginUser, setSocialLoginUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);

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

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider | OAuthProvider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // New user - show password popup
        setSocialLoginUser(user);
        setShowPasswordPopup(true);
      } else {
        // Existing user - proceed to workflows
        navigate('/workflows');
      }
    } catch (error) {
      setError('Error signing in with social provider');
    }
  };

  const handlePasswordSubmit = async (newPassword: string) => {
    try {
      if (socialLoginUser) {
        // Update user's password
        await updatePassword(socialLoginUser, newPassword);
        
        // Store user data in Firestore
        await setDoc(doc(db, 'users', socialLoginUser.uid), {
          email: socialLoginUser.email,
          displayName: socialLoginUser.displayName,
          photoURL: socialLoginUser.photoURL,
          createdAt: new Date().toISOString(),
          provider: socialLoginUser.providerData[0].providerId
        });

        // Close popup and navigate
        setShowPasswordPopup(false);
        setSocialLoginUser(null);
        navigate('/workflows');
      }
    } catch (error) {
      setError('Error setting password');
    }
  };

  const handleGoogleLogin = () => {
    handleSocialLogin(new GoogleAuthProvider());
  };

  const handleFacebookLogin = () => {
    handleSocialLogin(new FacebookAuthProvider());
  };

  const handleAppleLogin = () => {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    handleSocialLogin(provider);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
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
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // Add forgot password logic here
              }}
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