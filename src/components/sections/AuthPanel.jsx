import { useState } from 'react';
import { GoldButton } from '../ui';
import { useAuthStore } from '../../store/authStore';

const INITIAL_LOGIN = { email: '', password: '' };
const INITIAL_REGISTER = { fullName: '', email: '', password: '', phone: '' };

export default function AuthPanel() {
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN);
  const [registerForm, setRegisterForm] = useState(INITIAL_REGISTER);

  const {
    user,
    status,
    error,
    mode,
    setMode,
    clearError,
    login,
    register,
    logout,
  } = useAuthStore();

  const isLoading = status === 'loading';
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';

  const welcomeText = user
    ? `Sesión iniciada como ${user.fullName}. Tu rol actual es ${user.role}.`
    : 'Crea tu cuenta para reservar. Solo las credenciales admin podrán abrir el dashboard.';

  const handleModeChange = (nextMode) => {
    clearError();
    setMode(nextMode);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    await login(loginForm);
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    await register(registerForm);
  };

  return (
    <aside className="auth-panel">
      <div className="auth-panel__eyebrow">Acceso y reservas</div>
      <h2 className="auth-panel__title">Clientes y administradores</h2>
      <p className="auth-panel__subtitle">{welcomeText}</p>

      <div className="auth-panel__switch">
        <button
          type="button"
          className={`auth-panel__switch-btn ${mode === 'login' ? 'is-active' : ''}`}
          onClick={() => handleModeChange('login')}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          className={`auth-panel__switch-btn ${mode === 'register' ? 'is-active' : ''}`}
          onClick={() => handleModeChange('register')}
        >
          Crear cuenta
        </button>
      </div>

      {error && <p className="auth-panel__error">{error}</p>}

      {!isAuthenticated && mode === 'login' && (
        <form className="auth-panel__form" onSubmit={handleLoginSubmit}>
          <label className="auth-panel__field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="admin@barberia.com"
              value={loginForm.email}
              onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label className="auth-panel__field">
            <span>Contraseña</span>
            <input
              type="password"
              name="password"
              placeholder="Ingresa tu contraseña"
              value={loginForm.password}
              onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>
          <GoldButton size="md" type="submit" disabled={isLoading}>{isLoading ? 'Validando...' : 'Entrar'}</GoldButton>
        </form>
      )}

      {!isAuthenticated && mode === 'register' && (
        <form className="auth-panel__form" onSubmit={handleRegisterSubmit}>
          <label className="auth-panel__field">
            <span>Nombre completo</span>
            <input
              type="text"
              name="fullName"
              placeholder="Tu nombre"
              value={registerForm.fullName}
              onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
              required
            />
          </label>
          <label className="auth-panel__field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="tu@correo.com"
              value={registerForm.email}
              onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label className="auth-panel__field">
            <span>Teléfono</span>
            <input
              type="tel"
              name="phone"
              placeholder="555-123-4567"
              value={registerForm.phone}
              onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </label>
          <label className="auth-panel__field">
            <span>Contraseña</span>
            <input
              type="password"
              name="password"
              placeholder="Mínimo 6 caracteres"
              value={registerForm.password}
              onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
              required
              minLength="6"
            />
          </label>
          <GoldButton size="md" type="submit" disabled={isLoading}>{isLoading ? 'Creando...' : 'Crear cuenta'}</GoldButton>
        </form>
      )}

      {isAuthenticated && (
        <div className="auth-panel__session">
          <div className="auth-panel__session-card">
            <span className="auth-panel__session-label">Usuario</span>
            <strong>{user.fullName}</strong>
          </div>
          <div className="auth-panel__session-card">
            <span className="auth-panel__session-label">Correo</span>
            <strong>{user.email}</strong>
          </div>
          <div className="auth-panel__session-card">
            <span className="auth-panel__session-label">Rol</span>
            <strong>{user.role}</strong>
          </div>
          {isAdmin && (
            <div className="auth-panel__session-card">
              <span className="auth-panel__session-label">Acceso</span>
              <strong>Panel admin habilitado</strong>
            </div>
          )}
          <GoldButton size="md" outlined onClick={logout}>Cerrar sesión</GoldButton>
        </div>
      )}

      <div className="auth-panel__hint">
        <span>Solo las credenciales admin pueden entrar al dashboard:</span>
        <strong>admin@barberia.com / admin123</strong>
      </div>
    </aside>
  );
}