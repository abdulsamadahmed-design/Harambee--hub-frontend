// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Input from "./Input";

afterEach(() => {
  cleanup();
});

describe("Input component", () => {
  it("displays its label", () => {
    render(
      <Input
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByLabelText("Email")).toBeTruthy();
  });

  it("accepts user input", () => {
    const handleChange = vi.fn();

    render(
      <Input
        label="Username"
        name="username"
        value=""
        onChange={handleChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "Mohamed" },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("displays a placeholder", () => {
    render(
      <Input
        name="email"
        value=""
        onChange={() => {}}
        placeholder="Enter your email"
      />
    );

    expect(screen.getByPlaceholderText("Enter your email")).toBeTruthy();
  });

  it("marks the input as required", () => {
  render(
    <Input
      label="Email"
      name="email"
      value=""
      onChange={() => {}}
      required
    />
  );

  expect(screen.getByRole("textbox").required).toBe(true);
});

  it("displays validation errors", () => {
    render(
      <Input
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        error="Email is required"
      />
    );

    expect(screen.getByText("Email is required")).toBeTruthy();
    expect(
      screen.getByLabelText("Email").getAttribute("aria-invalid")
    ).toBe("true");
  });

  it("can be disabled", () => {
    render(
      <Input
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        disabled
      />
    );

    expect(screen.getByLabelText("Email").disabled).toBe(true);
  });
});
