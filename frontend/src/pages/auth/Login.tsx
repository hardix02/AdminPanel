import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import * as z from 'zod';
import axios from 'axios';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { login } from '../../services/authService';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'admin123',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      clearErrors('root');
      logout();
      const response = await login(data);
      setAuth(response.user, response.token);
      toast.success('Successfully logged in!');
    } catch (error) {
      let message: string;
      if (axios.isAxiosError(error)) {
        if (error.response) {
          message = (error.response.data?.message as string) || `Server error (${error.response.status})`;
        } else if (error.request) {
          message = 'Unable to reach the server. Is the backend running?';
        } else {
          message = 'Request failed. Please try again.';
        }
      } else {
        message = 'Login failed. Please try again.';
      }

      setError('root', { message });
      toast.error(message);
    }
  };

  return (
    <div className="app-shell">
      <div className="login-page login-page-centered">
        <motion.section
          className="login-panel login-panel-full"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="login-card login-card-centered">
            <div className="login-card-header login-card-header-centered">
              <div className="brand-lockup brand-lockup-centered">
                <div className="brand-mark">
                  <ShieldCheck size={22} />
                </div>
                <div className="brand-copy">
                  <p>EX5 Admin Panel</p>
                  <h1>Access Management</h1>
                </div>
              </div>

              <h2>Sign in to continue</h2>
              <p className="login-muted login-muted-centered">
                Use the admin account to manage algo status, expiry, and protected user access from one dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form login-form-centered">
              <div className="input-group">
                <label className="input-label" htmlFor="email">
                  <span>Email address</span>
                  <span className="input-hint">Default admin</span>
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  className="field"
                  placeholder="admin@example.com"
                />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="password">
                  <span>Password</span>
                  <span className="input-hint">Seeded credentials</span>
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  className="field"
                  placeholder="admin123"
                />
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>

              {errors.root?.message && <p className="form-error-banner">{errors.root.message}</p>}

              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Signing in...' : 'Enter dashboard'}
                {!isSubmitting && <ArrowRight size={18} />}
              </button>
            </form>

            <p className="login-footer-note">Default seeded login: `admin@example.com` / `admin123`</p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Login;
