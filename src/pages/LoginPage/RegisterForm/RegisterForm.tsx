import { useState, useMemo, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '@/hooks/auth/useRegister';
import styles from '../AuthPage.module.css';
import { ErrorMessage } from '@/components/UI/ErrorMessage/ErrorMessage';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useRegister();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const usernameValid = username.length >= 3;
  const displayNameValid = displayName.length >= 2;
  const emailValid = email.includes('@');
  const passwordValid = password.length >= 6;

  const isValid = useMemo(
    () => usernameValid && displayNameValid && emailValid && passwordValid,
    [usernameValid, displayNameValid, emailValid, passwordValid]
  );

  const handleRegister = async () => {
    if (!isValid) return;

    const ok = await register(username, displayName, email, password);
    if (ok) navigate('/');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid && !loading) {
      handleRegister();
    }
  };

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Create account</h2>

      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <p className={styles.error}>
          {!usernameValid && username.length > 0
            ? 'Username must be at least 3 characters'
            : ''}
        </p>
      </div>

      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <p className={styles.error}>
          {!displayNameValid && displayName.length > 0
            ? 'Display name must be at least 2 characters'
            : ''}
        </p>
      </div>

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
        onClick={handleRegister}
      >
        {loading ? 'Creating account...' : 'Sign up'}
      </button>

      <ErrorMessage>{error || ''}</ErrorMessage>
    </div>
  );
};
