import { useState, useMemo, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/hooks/auth/useLogin';
import styles from '../AuthPage.module.css';
import { ErrorMessage } from '@/components/UI/ErrorMessage/ErrorMessage';

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailValid = email.includes('@');
  const passwordValid = password.length >= 6;

  const isValid = useMemo(
    () => emailValid && passwordValid,
    [emailValid, passwordValid]
  );

  const handleLogin = async () => {
    if (!isValid) return;

    const ok = await login(email, password);
    if (ok) navigate('/');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid && !loading) {
      handleLogin();
    }
  };

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Sign in</h2>

      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <p className={styles.error}>
          {!emailValid && email.length > 0 ? 'Invalid email format' : ''}
        </p>
      </div>

      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <p className={styles.error}>
          {!passwordValid && password.length > 0
            ? 'Password must be at least 6 characters'
            : ''}
        </p>
      </div>

      <button
        className={styles.button}
        disabled={!isValid || loading}
        onClick={handleLogin}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      <ErrorMessage>{error || ''}</ErrorMessage>
    </div>
  );
};
