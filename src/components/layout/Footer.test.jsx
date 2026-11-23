// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

afterEach(() => {
  cleanup();
});

describe("Footer component", () => {
  it("displays the Harambee Hub brand", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByText("Harambee Hub")).toBeTruthy();
  });

  it("displays the footer navigation links", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("link", { name: "Home" })
    ).toBeTruthy();

    expect(
      screen.getByRole("link", { name: "Campaigns" })
    ).toBeTruthy();

    expect(
      screen.getByRole("link", { name: "Login" })
    ).toBeTruthy();

    expect(
      screen.getByRole("link", { name: "Register" })
    ).toBeTruthy();
  });

  it("has an accessible footer navigation label", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("navigation", { name: "Footer navigation" })
    ).toBeTruthy();
  });

  it("displays the current year in the copyright text", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(
      screen.getByText(
        `© ${new Date().getFullYear()} Harambee Hub. All rights reserved.`
      )
    ).toBeTruthy();
  });
});
