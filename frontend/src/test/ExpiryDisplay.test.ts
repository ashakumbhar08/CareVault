import { describe, it, expect, beforeEach } from 'vitest';

// Helper function to check if expiry is expired
function isExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return expiresAt <= now;
}

// Helper function to get formatted expiry time
function getFormattedExpiry(expiresAt: number): string {
  const date = new Date(expiresAt * 1000);
  return date.toLocaleDateString();
}

describe('ExpiryDisplay', () => {
  let currentTime: number;

  beforeEach(() => {
    currentTime = Math.floor(Date.now() / 1000);
  });

  it('correctly identifies expired grant', () => {
    const expiredTime = currentTime - 86400; // 1 day ago
    expect(isExpired(expiredTime)).toBe(true);
  });

  it('correctly identifies active grant', () => {
    const futureTime = currentTime + 86400; // 1 day from now
    expect(isExpired(futureTime)).toBe(false);
  });

  it('correctly identifies just-expired grant', () => {
    const justExpired = currentTime - 1;
    expect(isExpired(justExpired)).toBe(true);
  });

  it('correctly identifies just-not-expired grant', () => {
    const justNotExpired = currentTime + 1;
    expect(isExpired(justNotExpired)).toBe(false);
  });

  it('formats expiry date correctly', () => {
    const timestamp = currentTime + 604800; // 1 week from now
    const formatted = getFormattedExpiry(timestamp);
    expect(formatted).toMatch(/\d+\/\d+\/\d+/);
  });

  it('handles year boundary correctly', () => {
    // December 31, 2025
    const timestamp = new Date('2025-12-31').getTime() / 1000;
    const formatted = getFormattedExpiry(timestamp);
    expect(formatted).toContain('12/31/2025');
  });

  it('handles month boundary correctly', () => {
    // February 28, 2025
    const timestamp = new Date('2025-02-28').getTime() / 1000;
    const formatted = getFormattedExpiry(timestamp);
    expect(formatted).toContain('2025');
  });

  it('correctly evaluates 30-day expiry', () => {
    const thirtyDaysFromNow = currentTime + 2592000; // 30 days
    expect(isExpired(thirtyDaysFromNow)).toBe(false);
  });

  it('correctly evaluates 1-year expiry', () => {
    const oneYearFromNow = currentTime + 31536000; // 1 year
    expect(isExpired(oneYearFromNow)).toBe(false);
  });
});
