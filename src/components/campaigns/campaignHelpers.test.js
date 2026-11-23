import { describe, it, expect } from "vitest";
import {
  getStatus,
  getGoal,
  getRaised,
  getEndDate,
  getOrganizerName,
  getCampaignsFromResponse,
  daysLeft,
} from "./campaignHelpers";

describe("campaignHelpers", () => {
  describe("getStatus", () => {
    it("maps 'closed' to 'completed'", () => {
      expect(getStatus({ status: "closed" })).toBe("completed");
    });
    it("defaults to 'active' if no status", () => {
      expect(getStatus({})).toBe("active");
    });
  });

  describe("getGoal and getRaised", () => {
    it("parses string goals into numbers", () => {
      expect(getGoal({ goal_amount: "50000.50" })).toBe(50000.5);
    });
    it("returns 0 for missing or invalid goals", () => {
      expect(getGoal({})).toBe(0);
      expect(getGoal({ goal_amount: "abc" })).toBe(0);
    });
    it("parses raised amounts and falls back to total_pledged", () => {
      expect(getRaised({ raised_amount: 1000 })).toBe(1000);
      expect(getRaised({ total_pledged: 2500 })).toBe(2500);
      expect(getRaised({})).toBe(0);
    });
  });

  describe("getEndDate and daysLeft", () => {
    it("returns null for missing or invalid dates", () => {
      expect(getEndDate({})).toBeNull();
      expect(daysLeft("invalid-date")).toBeNull();
    });
    it("calculates days left correctly for a future date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(daysLeft(futureDate.toISOString())).toBe(5);
    });
  });

  describe("getOrganizerName", () => {
    it("returns the nested organizer name", () => {
      expect(getOrganizerName({ organizer: { name: "Amina" } })).toBe("Amina");
    });
    it("falls back to organizer_name", () => {
      expect(getOrganizerName({ organizer_name: "Brian" })).toBe("Brian");
    });
    it("falls back to Organizer ID if no name", () => {
      expect(getOrganizerName({ organizer_id: 1 })).toBe("Organizer #1");
    });
  });

  describe("getCampaignsFromResponse", () => {
    it("returns empty array for null data", () => {
      expect(getCampaignsFromResponse(null)).toEqual([]);
    });
    it("extracts items array from paginated response", () => {
      const paginatedData = { items: [{ id: 1 }, { id: 2 }] };
      expect(getCampaignsFromResponse(paginatedData)).toHaveLength(2);
    });
  });
});
