import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);

      const user = await login(email, password);

      // Return users to the page they originally requested
      const requestedPage = location.state?.from;

      if (requestedPage) {
        navigate(requestedPage, { replace: true });
        return;
      }

      // Otherwise, redirect according to their role
      const dashboardRoutes = {
        organizer: "/organizer",
        contributor: "/contributor",
        admin: "/admin",
      };

      navigate(dashboardRoutes[user.role] || "/", {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "440px",
        margin: "60px auto",
        padding: "24px",
      }}
    >
      <h1>Welcome Back</h1>

      <p>Log in to your Harambee Hub account.</p>

      {error && (
        <div role="alert" className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          autoComplete="email"
          required
          disabled={submitting}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          disabled={submitting}
        />

        <Button
          type="submit"
          loading={submitting}
          disabled={submitting}
        >
          Log In
        </Button>
      </form>
      <p style={{ marginTop: "16px" }}>
        Forgot your password?{" "}
        <Link to="/reset-password">Reset it here</Link>
      </p>

      <p style={{ marginTop: "20px" }}>
        Don't have an account?{" "}
        <Link to="/register">Create one</Link>
      </p>
    </main>
  );
}
