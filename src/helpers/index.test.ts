// formatPhoneNumber.test.ts
import { describe, it, expect } from "vitest";
import {
  formatPhoneNumber,
  formatAddress,
  npsImageUrl,
  truncate,
} from "./index";

describe("formatPhoneNumber", () => {
  it("should format a standard 10-digit phone number string", () => {
    const input = "1234567890";
    const expected = "(123) 456-7890";
    expect(formatPhoneNumber(input)).toBe(expected);
  });

  it("should format a standard +1 prefix 10-digit phone number string", () => {
    const input = "11234567890";
    const expected = "(123) 456-7890";
    expect(formatPhoneNumber(input)).toBe(expected);
  });

  it("should return the undefined if it is too short", () => {
    const input = "12345";
    expect(formatPhoneNumber(input)).toBeNull();
  });

  it("should return the undefined if it is too long", () => {
    const input = "123456789012";
    expect(formatPhoneNumber(input)).toBeNull();
  });
  it("should return null if the phone number is undefined", () => {
    const input = undefined;
    expect(formatPhoneNumber(input)).toBeNull();
  });
  it("should return null if the phone number is null", () => {
    const input = null;
    expect(formatPhoneNumber(input)).toBeNull();
  });
  it("should return null if the phone number is an empty string", () => {
    const input = "";
    expect(formatPhoneNumber(input)).toBeNull();
  });
});

describe("formatAddress", () => {
  it("should format an address object", () => {
    const input = {
      line1: "123 Main St",
      city: "Anytown",
      stateCode: "CA",
      postalCode: "12345",
    };
    const expected = "123 Main St, Anytown, CA 12345";
    expect(formatAddress(input)).toBe(expected);
  });
  it("should return null if the address is undefined", () => {
    const input = undefined;
    expect(formatAddress(input)).toBeNull();
  });
  it("should return null if the address is null", () => {
    const input = null;
    expect(formatAddress(input)).toBeNull();
  });
  it("should return null if the address is an empty object", () => {
    const input = {};
    expect(formatAddress(input)).toBeNull();
  });
});

describe("npsImageUrl", () => {
  it("appends crop params when the url has no query string", () => {
    expect(npsImageUrl("https://example.com/photo.jpg", 1200, 1600)).toBe(
      "https://example.com/photo.jpg?w=1200&h=1600&fit=crop&auto=format",
    );
  });

  it("appends with & when the url already has a query string", () => {
    expect(npsImageUrl("https://example.com/photo.jpg?foo=1", 600, 800)).toBe(
      "https://example.com/photo.jpg?foo=1&w=600&h=800&fit=crop&auto=format",
    );
  });

  it("returns null when the url is missing", () => {
    expect(npsImageUrl(undefined, 1200, 1600)).toBeNull();
  });
});

describe("truncate", () => {
  it("should truncate to a given length", () => {
    const input = "This is a test string";
    const expected = "This is a test...";
    expect(truncate(input, 14)).toBe(expected);
  });
  it("should return null if the text is undefined", () => {
    const input = undefined;
    expect(truncate(input, 14)).toBeNull();
  });
  it("should return null if the text is null", () => {
    const input = null;
    expect(truncate(input, 14)).toBeNull();
  });
  it("should return the text if it is less than the given length", () => {
    const input = "This is a test string";
    const expected = "This is a test string";
    expect(truncate(input, 30)).toBe(expected);
  });
  it("should return the text if it is equal to the given length", () => {
    const input = "This";
    const expected = "This";
    expect(truncate(input, 4)).toBe(expected);
  });
});
