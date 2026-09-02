import { describe, it, expect } from 'vitest';
import { ruleBasedParse, getFallbackIntent } from '../src/services/query/intentParser.js';
import { calculateDateRange } from '../src/services/query/queryBuilder.js';
import { synthesizeAnswer, generateDeterministicSummary } from '../src/services/query/searchService.js';

describe('Search & Query Processing', () => {
  describe('Intent Parsing', () => {
    it('should correctly classify deadline and time-sensitive queries', () => {
      const intent = ruleBasedParse('What assignments are due tomorrow?');
      expect(intent.searchType).toBe('structured');
      expect(intent.category).toBe('assignment');
      expect(intent.dateRangeType).toBe('tomorrow');
    });

    it('should identify topic keyword queries', () => {
      const intent = ruleBasedParse('What did I save about hackathon registration?');
      expect(intent.searchType).toBe('keyword');
      expect(intent.category).toBe('registration');
      expect(intent.searchTerm).toContain('hackathon');
    });

    it('should flag urgent and critical priority requests', () => {
      const intent = ruleBasedParse('Show all critical exam notices');
      expect(intent.category).toBe('exam');
      expect(intent.priority).toBe('critical');
    });

    it('should provide fallback intent for empty or invalid queries', () => {
      const fallback = getFallbackIntent('');
      expect(fallback.searchType).toBe('structured');
      expect(fallback.searchTerm).toBe('');
    });
  });

  describe('Date Range Query Builder', () => {
    it('should compute valid start and end bounds for today', () => {
      const now = new Date('2026-08-30T10:00:00.000Z');
      const range = calculateDateRange('today', now);

      expect(range).not.toBeNull();
      expect(range.$gte.getHours()).toBe(0);
      expect(range.$lte.getHours()).toBe(23);
    });

    it('should calculate 3-day lookahead window for upcoming alerts', () => {
      const now = new Date('2026-08-30T10:00:00.000Z');
      const range = calculateDateRange('next_3_days', now);

      const diffDays = Math.round((range.$lte - range.$gte) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(3);
    });
  });

  describe('Answer Synthesis', () => {
    it('should provide a friendly message when no items match', async () => {
      const answer = await synthesizeAnswer('Physics exam notes', []);
      expect(answer).toContain('couldn\'t find any saved notices');
    });

    it('should generate a deterministic summary when items exist', () => {
      const mockItems = [
        {
          title: 'SE Assignment 3',
          deadline: new Date('2026-09-05T23:59:00.000Z'),
          action: 'Upload PDF to LMS'
        }
      ];

      const answer = generateDeterministicSummary('SE assignment', mockItems);
      expect(answer).toContain('SE Assignment 3');
      expect(answer).toContain('Upload PDF to LMS');
    });
  });
});
