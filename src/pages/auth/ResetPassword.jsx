import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    new_password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const email = formData.email.trim().toLowerCase();
    const code = formData.code.trim();

    if (!email || !code || !formData.new_password) {
      setError("Please complete all required fields.");
      return;
    }

    if (formData.new_password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.new_password.length > 128) {
      setError("Password cannot exceed 128 characters.");
      return;
    }

    if (formData.new_password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/auth/reset-password", {
        email,
        code,
        new_password: formData.new_password,
      });

      setSuccess(
        response?.message || "Password reset successfully. You can now log in."
      );

      setFormData({
        email,
        code: "",
        new_password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.message || "Unable to reset password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "480px",
        margin: "60px auto",
        padding: "24px",
      }}
    >
      <h1>Reset Your Password</h1>

      <p>
        Enter the recovery code sent to your registered email
        address and choose a new password.
      </p>

      {error && (
        <div role="alert" className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="success-message">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your registered email"
          autoComplete="email"
          required
          disabled={submitting || Boolean(success)}
        />

        <Input
          label="Recovery Code"
          name="code"
          type="text"
          value={formData.code}
          onChange={handleChange}
          placeholder="Enter the code from your email"
          autoComplete="one-time-code"
          required
          disabled={submitting || Boolean(success)}
        />

        <Input
          label="New Password"
          name="new_password"
          type="password"
          value={formData.new_password}
          onChange={handleChange}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          disabled={submitting || Boolean(success)}
        />

        <Input
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Enter your new password again"
          autoComplete="new-password"
          required
          disabled={submitting || Boolean(success)}
        />

        {!success && (
          <Button
            type="submit"
            loading={submitting}
            disabled={submitting}
          >
            Reset Password
          </Button>
        )}
      </form>

      <p style={{ marginTop: "20px" }}>
        Remember your password?{" "}
        <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
