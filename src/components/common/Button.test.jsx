// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Button from "./Button";

afterEach(() => {
  cleanup();
});

describe("Button component", () => {
  it("displays its children", () => {
    render(<Button>Submit</Button>);

    expect(
      screen.getByRole("button", { name: "Submit" })
    ).toBeTruthy();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Click me" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled is true", () => {
    render(<Button disabled>Submit</Button>);

    const button = screen.getByRole("button", { name: "Submit" });

    expect(button.disabled).toBe(true);
  });

  it("shows Loading when loading is true", () => {
    render(<Button loading>Submit</Button>);

    const button = screen.getByRole("button", { name: "Loading..." });

    expect(button).toBeTruthy();
    expect(button.disabled).toBe(true);
  });

  it("applies the correct variant and size classes", () => {
    render(
      <Button variant="secondary" size="large">
        Continue
      </Button>
    );

    const button = screen.getByRole("button", { name: "Continue" });

    expect(button.className).toContain("btn-secondary");
    expect(button.className).toContain("btn-large");
  });
});
