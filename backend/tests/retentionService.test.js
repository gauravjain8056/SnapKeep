import { describe, it, expect } from 'vitest';
import { RetentionService } from '../src/services/retention/retentionService.js';

describe('RetentionService', () => {
  it('should format calendar date string for a specific timezone', () => {
    const testDate = new Date('2026-08-30T18:30:00.000Z'); // 00:00 Aug 31 in Asia/Kolkata
    const dateStr = RetentionService.getCalendarDateString(testDate, 'Asia/Kolkata');

    expect(dateStr).toBe('2026-08-31');
  });

  it('should detect first interaction of the day', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const isFirst = RetentionService.isFirstInteractionOfDay(yesterday, 'Asia/Kolkata');

    expect(isFirst).toBe(true);
  });

  it('should detect subsequent interactions on the same calendar day', () => {
    const now = new Date();
    const isFirst = RetentionService.isFirstInteractionOfDay(now, 'Asia/Kolkata');

    expect(isFirst).toBe(false);
  });

  it('should return true if lastInteractionDate is null or undefined', () => {
    expect(RetentionService.isFirstInteractionOfDay(null, 'Asia/Kolkata')).toBe(true);
    expect(RetentionService.isFirstInteractionOfDay(undefined, 'Asia/Kolkata')).toBe(true);
  });
});
