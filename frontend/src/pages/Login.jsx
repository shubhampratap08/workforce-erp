import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Eye, EyeOff, Lock, Mail, ShieldCheck, Users, WalletCards } from "lucide-react";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed");
      }

      localStorage.setItem("workforce_token", result.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <section className="login-promo" aria-label="WorkForce ERP benefits">
          <div className="login-orb login-orb-one" />
          <div className="login-orb login-orb-two" />
          <div className="login-promo-content">
            <div className="login-brand">
              <div className="login-logo" aria-hidden="true">W</div>
              <div>
                <h2>WorkForce ERP</h2>
                <p>Admin Portal</p>
              </div>
            </div>
            <div className="login-promo-copy">
              <p className="login-eyebrow">One workspace. Total control.</p>
              <h1>Manage your workforce with confidence</h1>
              <p>Bring your people, attendance, payroll, and operations together in one clear, connected workspace.</p>
            </div>
            <div className="login-feature-list">
              <div className="login-feature-item"><span className="login-feature-icon"><Users size={18} /></span><span>Workforce Management</span></div>
              <div className="login-feature-item"><span className="login-feature-icon"><CalendarCheck size={18} /></span><span>Attendance Tracking</span></div>
              <div className="login-feature-item"><span className="login-feature-icon"><WalletCards size={18} /></span><span>Payroll Automation</span></div>
            </div>
          </div>
        </section>

        <section className="login-form-panel">
          <div className="login-form-heading">
            <div className="login-security-icon"><ShieldCheck size={20} /></div>
            <p className="login-eyebrow">Secure admin access</p>
            <h1>Welcome Back</h1>
            <p className="login-subtitle">Sign in to continue to your admin portal</p>
          </div>

          {error && <div className="login-error" role="alert">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <div className="login-input-wrap"><Mail size={18} aria-hidden="true" /><input id="login-email" type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" placeholder="you@company.com" required /></div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap"><Lock size={18} aria-hidden="true" /><input id="login-password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} autoComplete="current-password" placeholder="Enter your password" required /><button type="button" className="login-password-toggle" onClick={() => setShowPassword((previous) => !previous)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </div>

            <div className="login-options"><label className="login-remember"><input type="checkbox" /><span>Remember me</span></label><span className="login-forgot">Forgot password?</span></div>
            <button className="login-submit" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
          </form>
          <p className="login-footer">Authorized WorkForce ERP administrators only</p>
        </section>
      </div>
    </div>
  );
}

export default Login;
