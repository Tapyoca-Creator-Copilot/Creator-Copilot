import { UserAuth } from '@/features/auth/context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSignin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signInUser, signInWithGoogle } = UserAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error: signInError } = await signInUser(email, password);

    if (signInError) {
      setError('Incorrect email or password. Please try again.');
    } else if (data) {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    const { error: googleError } = await signInWithGoogle();

    if (googleError) {
      setError("Unable to continue with Google. Please try again.");
    }
  };

  return {
    email,
    password,
    error,
    loading,
    showPassword,
    setShowPassword,
    handleEmailChange,
    handlePasswordChange,
    handleSignIn,
    handleGoogleSignIn
  };
};
