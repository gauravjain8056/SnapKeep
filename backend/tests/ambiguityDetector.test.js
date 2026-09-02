import { describe, it, expect } from 'vitest';
import { AmbiguityDetector } from '../src/services/ai/ambiguityDetector.js';

describe('AmbiguityDetector', () => {
  it('should flag ambiguous relative dates like "Friday"', () => {
    const rawData = {
      title: 'SE Assignment 2',
      description: 'Submit SE assignment before Friday',
      category: 'assignment',
      deadline: 'Friday',
      action: 'Submit assignment on portal'
    };

    const sanitized = AmbiguityDetector.validateAndSanitize(rawData);

    expect(sanitized.needsConfirmation).toBe(true);
    expect(sanitized.deadline).toBeNull();
    expect(sanitized.confidence).toBeLessThanOrEqual(0.55);
    expect(sanitized.confirmationReason).toContain('relative date');
  });

  it('should accept valid ISO date strings', () => {
    const validIsoDate = '2026-09-15T23:59:00.000Z';
    const rawData = {
      title: 'Tuition Fee Payment',
      description: 'Pay semester tuition fee',
      category: 'payment',
      deadline: validIsoDate,
      action: 'Pay online via college portal'
    };

    const sanitized = AmbiguityDetector.validateAndSanitize(rawData);

    expect(sanitized.needsConfirmation).toBe(false);
    expect(sanitized.deadline).toBeInstanceOf(Date);
    expect(sanitized.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('should flag action-required categories if action is missing', () => {
    const rawData = {
      title: 'Exam Schedule',
      description: 'Final exam schedule announced',
      category: 'exam',
      deadline: '2026-10-01T09:00:00.000Z',
      action: ''
    };

    const sanitized = AmbiguityDetector.validateAndSanitize(rawData);

    expect(sanitized.needsConfirmation).toBe(true);
    expect(sanitized.confirmationReason).toContain('clear action step');
  });

  it('should correctly infer relevance category based on text content', () => {
    expect(AmbiguityDetector.inferRelevanceCategory('assignment', 'Mandatory CS homework')).toBe('academic');
    expect(AmbiguityDetector.inferRelevanceCategory('payment', 'Tuition installment fee')).toBe('financial');
    expect(AmbiguityDetector.inferRelevanceCategory('opportunity', 'Annual college hackathon')).toBe('opportunity');
    expect(AmbiguityDetector.inferRelevanceCategory('other', 'College office circular')).toBe('administrative');
    expect(AmbiguityDetector.inferRelevanceCategory('other', 'Random note')).toBe('general');
  });
});
