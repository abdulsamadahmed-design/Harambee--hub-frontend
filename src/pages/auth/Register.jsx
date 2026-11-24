import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../../services/api";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "contributor",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
    setSuccess("");
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Name cannot exceed 100 characters.";
    }

    const email = formData.email.trim();

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    } else if (email.length > 120) {
      newErrors.email = "Email cannot exceed 120 characters.";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (formData.phone.trim().length > 20) {
      newErrors.phone = "Phone number cannot exceed 20 characters.";
    }

    if (!["organizer", "contributor"].includes(formData.role)) {
      newErrors.role = "Please select a valid account type.";
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setServerError("");
    setSuccess("");

    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone.trim() || null,
      role: formData.role,
    };

    try {
      setSubmitting(true);

      const response = await api.post("/auth/register", payload);

      setSuccess(
        response.email_sent
          ? "Registration successful! Check your email for the verification link. You must verify your email before logging in."
          : "Your account was created, but the verification email could not be sent. Please contact the administrator before attempting to log in."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "contributor",
      });
    } catch (err) {
      setServerError(
        err.message || "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: "480px",
        margin: "40px auto",
        padding: "24px",
      }}
    >
      <h1>Create Account</h1>

      <p>Join Harambee Hub and support meaningful causes.</p>

      {serverError && (
        <div role="alert" className="error-message">
          {serverError}
        </div>
      )}

      {success && (
        <div role="status" className="success-message">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          autoComplete="name"
          error={errors.name}
          required
          disabled={submitting}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          autoComplete="email"
          error={errors.email}
          required
          disabled={submitting}
        />

        <Input
          label="Phone Number (Optional)"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          autoComplete="tel"
          error={errors.phone}
          disabled={submitting}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password}
          required
          disabled={submitting}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          required
          disabled={submitting}
        />

        <div className="form-group">
          <label htmlFor="role">Account Type</label>

          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={submitting}
          >
            <option value="contributor">Contributor</option>
            <option value="organizer">Organizer</option>
          </select>

          {errors.role && (
            <small className="input-error">
              {errors.role}
            </small>
          )}
        </div>

        <Button
          type="submit"
          loading={submitting}
          disabled={submitting}
        >
          Create Account
        </Button>
      </form>

      <p style={{ marginTop: "20px" }}>
        Already have an account?{" "}
        <Link to="/login">Log in</Link>
      </p>
    </main>
  );
}
