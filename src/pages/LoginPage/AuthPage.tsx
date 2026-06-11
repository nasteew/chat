import { useState } from 'react';
import styles from './AuthPage.module.css';

import { LoginForm } from './LoginForm/LoginForm';
import { RegisterForm } from './RegisterForm/RegisterForm';

export const AuthPage = () => {
  const [mode, setMode] = useState('login');

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.logo}>ChatApp</h1>
          <p className={styles.subtitle}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        <div className={styles.switch}>
          <div
            className={`${styles.switcher} ${
              mode === 'register' ? styles.right : ''
            }`}
          />

          <button className={styles.switchBtn} onClick={() => setMode('login')}>
            Login
          </button>

          <button
            className={styles.switchBtn}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <div className={styles.forms}>
          <div
            className={`${styles.formSlide} ${
              mode === 'login' ? styles.show : styles.hideLeft
            }`}
          >
            <LoginForm />
          </div>

          <div
            className={`${styles.formSlide} ${
              mode === 'register' ? styles.show : styles.hideRight
            }`}
          >
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
};
