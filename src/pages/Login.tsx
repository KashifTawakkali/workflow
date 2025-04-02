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
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/workflows');
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError('An error occurred during login');
      }
    }
  };

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider | OAuthProvider) => {
    try {
      // Add scopes for Google provider
      if (provider instanceof GoogleAuthProvider) {
        provider.addScope('profile');
        provider.addScope('email');
      }

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // New user - show password popup
        setSocialLoginUser(user);
        setShowPasswordPopup(true);
      } else {
        // Check if password was previously set
        const userData = userDoc.data();
        if (!userData.hasPassword) {
          // Show password popup if password hasn't been set
          setSocialLoginUser(user);
          setShowPasswordPopup(true);
        } else {
          // Password already set, proceed to workflows
          navigate('/workflows');
        }
      }
    } catch (error: any) {
      console.error('Social login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled by user');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Login popup was blocked. Please allow popups for this site');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for social login');
      } else {
        setError('Error signing in with social provider: ' + error.message);
      }
    }
  };

  const handlePasswordSubmit = async (newPassword: string) => {
    try {
      if (socialLoginUser) {
        // Update user's password
        await updatePassword(socialLoginUser, newPassword);
        
        // Store user data in Firestore with password flag
        await setDoc(doc(db, 'users', socialLoginUser.uid), {
          email: socialLoginUser.email,
          displayName: socialLoginUser.displayName,
          photoURL: socialLoginUser.photoURL,
          createdAt: new Date().toISOString(),
          provider: socialLoginUser.providerData[0].providerId,
          hasPassword: true // Add flag to indicate password is set
        }, { merge: true }); // Use merge to update existing document

        // Close popup and navigate
        setShowPasswordPopup(false);
        setSocialLoginUser(null);
        navigate('/workflows');
      }
    } catch (error: any) {
      console.error('Password setup error:', error);
      setError(error.message || 'Error setting password');
    }
  };

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    // Add custom parameters for Google provider
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    handleSocialLogin(provider);
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
        width: '100vw',
        display: 'flex',
        position: 'relative',
        overflow: { xs: 'auto', md: 'hidden' },
        margin: 0,
        padding: 0,
        flexDirection: { xs: 'column', md: 'row' },
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -2,
        },
        '&::after': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url(${bgOverlay})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1,
        }
      }}
    >
      {/* Left side with logo and text */}
      <Box
        sx={{
          flex: { xs: 'none', md: 1 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: {
            xs: '40px 20px',
            sm: '40px',
            md: '0 40px',
            lg: '0 80px'
          },
          color: 'white',
          minHeight: { xs: '40vh', md: '100vh' },
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        <img 
          src={logo} 
          alt="HighBridge" 
          style={{ 
            width: '280px', 
            marginBottom: '48px',
            maxWidth: '100%',
            alignSelf: isMobile ? 'center' : 'flex-start'
          }} 
        />
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            mb: 2, 
            fontSize: {
              xs: '32px',
              sm: '40px',
              md: '48px',
              lg: '52px'
            },
            fontWeight: 500,
            letterSpacing: '-0.5px',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Building the Future...
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            fontSize: {
              xs: '16px',
              sm: '16px',
              md: '18px'
            },
            opacity: 0.9,
            maxWidth: { xs: '100%', md: '480px' },
            lineHeight: 1.6,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Typography>
      </Box>

      {/* Right side with login form */}
      <Box
        sx={{
          width: {
            xs: '100%',
            sm: '460px'
          },
          height: 'auto',
          minHeight: { xs: 'auto', sm: '768px' },
          position: { xs: 'relative', md: 'absolute' },
          top: { xs: 0, md: '50%' },
          left: { xs: 0, md: '780px' },
          transform: { xs: 'none', md: 'translateY(-50%)' },
          backgroundColor: 'white',
          borderRadius: { xs: 0, sm: '24px' },
          padding: {
            xs: '20px',
            sm: '40px'
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: { xs: 'none', sm: '0 4px 24px rgba(0, 0, 0, 0.1)' },
          margin: {
            xs: 0,
            sm: '20px auto',
            md: 0
          },
          maxWidth: {
            xs: '100%',
            sm: '460px'
          },
        }}
      >
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: '#333',
            fontSize: '14px',
            fontWeight: 600,
            mb: 1,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          WELCOME BACK!
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#333',
            fontSize: '28px',
            fontWeight: 600,
            mb: 4,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Log In to your Account
        </Typography>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <Typography sx={{ mb: 1, color: '#666', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>Email</Typography>
          <TextField
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Type here..."
            sx={{
              mb: 3,
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
              }
            }}
          />

          <Typography sx={{ mb: 1, color: '#666', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>Password</Typography>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type here..."
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
              mb: 3,
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

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: '#E5E5E5',
                    '&.Mui-checked': {
                      color: '#f44336',
                    },
                    width: '20px',
                    height: '20px',
                    marginRight: '8px',
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: '14px', color: '#666', fontFamily: "'Inter', sans-serif" }}>
                  Remember me
                </Typography>
              }
            />
            <Link 
              onClick={() => setShowForgotPasswordPopup(true)}
              sx={{ 
                color: '#666',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                cursor: 'pointer',
                '&:hover': {
                  color: '#f44336'
                }
              }}
            >
              Forgot Password?
            </Link>
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2, fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            sx={{
              bgcolor: '#f44336',
              color: 'white',
              py: 1.5,
              height: '48px',
              mb: 3,
              '&:hover': {
                bgcolor: '#d32f2f'
              },
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 500,
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Log In
          </Button>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography sx={{ color: '#666', fontSize: '14px', fontFamily: "'Inter', sans-serif" }}>Or</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              sx={{
                color: '#666',
                borderColor: '#E5E5E5',
                justifyContent: 'flex-start',
                gap: '12px',
                height: '48px',
                pl: 2,
                '&:hover': {
                  borderColor: '#666',
                  bgcolor: 'transparent'
                },
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                borderRadius: '8px',
                borderWidth: '1px',
              }}
            >
              <img src={GoogleIcon} alt="Google" style={{ width: 24, height: 24 }} />
              Log In with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleFacebookLogin}
              sx={{
                color: '#666',
                borderColor: '#E5E5E5',
                justifyContent: 'flex-start',
                gap: '12px',
                height: '48px',
                pl: 2,
                '&:hover': {
                  borderColor: '#666',
                  bgcolor: 'transparent'
                },
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                borderRadius: '8px',
                borderWidth: '1px',
              }}
            >
              <img src={FacebookIcon} alt="Facebook" style={{ width: 24, height: 24 }} />
              Log In with Facebook
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleAppleLogin}
              sx={{
                color: '#666',
                borderColor: '#E5E5E5',
                justifyContent: 'flex-start',
                gap: '12px',
                height: '48px',
                pl: 2,
                '&:hover': {
                  borderColor: '#666',
                  bgcolor: 'transparent'
                },
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                borderRadius: '8px',
                borderWidth: '1px',
              }}
            >
              <img src={AppleIcon} alt="Apple" style={{ width: 24, height: 24 }} />
              Log In with Apple
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography sx={{ fontSize: '14px', color: '#666', fontFamily: "'Inter', sans-serif" }}>
              New User?{' '}
              <Link 
                href="/signup" 
                underline="none" 
                sx={{ 
                  color: '#333',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  '&:hover': {
                    color: '#f44336'
                  }
                }}
              >
                SIGN UP HERE
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>

      <PasswordPopup
        open={showPasswordPopup}
        onClose={() => {
          setShowPasswordPopup(false);
          setSocialLoginUser(null);
        }}
        onSubmit={handlePasswordSubmit}
        email={socialLoginUser?.email || ''}
      />

      <ForgotPasswordPopup
        open={showForgotPasswordPopup}
        onClose={() => setShowForgotPasswordPopup(false)}
      />
    </Box>
  );
};

export default Login; 