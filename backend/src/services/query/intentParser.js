import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { config } from '../../config/env.js';
import { CATEGORIES, PRIORITIES } from '../../models/SnapItem.js';

const queryIntentSchema = z.object({
  searchType: z.enum(['structured', 'keyword']),
  category: z.string().nullable().optional(),
  priority: z.string().nullable().optional(),
  dateRangeType: z.enum([
    'none',
    'today',
    'tomorrow',
    'next_3_days',
    'this_week',
    'this_weekend',
    'next_week',
    'past',
    'all_upcoming'
  ]).default('none'),
  searchTerm: z.string().default(''),
  requireAction: z.boolean().default(false),
  requireConfirmationOnly: z.boolean().default(false),
  summaryFocus: z.string().default('general')
});

export async function parseIntent(userQuery, userTimezone = 'Asia/Kolkata') {
  if (!userQuery || typeof userQuery !== 'string') {
    return getFallbackIntent(userQuery);
  }

  if (!config.geminiApiKey) {
    return ruleBasedParse(userQuery);
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: config.geminiModel || 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.0
      }
    });

    const prompt = `Analyze this student natural language question for SnapKeep:
"${userQuery}"

User Timezone: ${userTimezone}
Available Categories: ${CATEGORIES.join(', ')}
Available Priorities: ${PRIORITIES.join(', ')}

Instructions:
1. "searchType": "structured" for date/deadline/category queries (e.g. "deadlines this week"), or "keyword" for topic/subject search (e.g. "Software Engineering notes").
2. "dateRangeType": "none", "today", "tomorrow", "next_3_days", "this_week", "this_weekend", "next_week", "past", "all_upcoming".
3. "category": Matching category or null.
4. "priority": "critical", "important", "informational", or null.
5. "searchTerm": Clean subject or keyword query (without filler words).

Return valid JSON adhering to:
{
  "searchType": "structured" | "keyword",
  "category": string | null,
  "priority": string | null,
  "dateRangeType": string,
  "searchTerm": string,
  "requireAction": boolean,
  "requireConfirmationOnly": boolean,
  "summaryFocus": string
}`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    const validated = queryIntentSchema.parse(parsed);

    if (validated.category && !CATEGORIES.includes(validated.category)) {
      validated.category = null;
    }
    if (validated.priority && !PRIORITIES.includes(validated.priority)) {
      validated.priority = null;
    }

    return validated;
  } catch (err) {
    console.warn('AI intent parser failed, falling back to rule-based parser:', err.message);
    return ruleBasedParse(userQuery);
  }
}

export function ruleBasedParse(query) {
  const q = query.toLowerCase();

  let searchType = 'structured';
  let dateRangeType = 'none';
  let category = null;
  let priority = null;

  if (q.includes('today')) dateRangeType = 'today';
  else if (q.includes('tomorrow')) dateRangeType = 'tomorrow';
  else if (q.includes('3 days') || q.includes('next 3 days')) dateRangeType = 'next_3_days';
  else if (q.includes('this weekend') || q.includes('weekend')) dateRangeType = 'this_weekend';
  else if (q.includes('this week') || q.includes('week')) dateRangeType = 'this_week';
  else if (q.includes('next week')) dateRangeType = 'next_week';
  else if (q.includes('deadline') || q.includes('due') || q.includes('pending')) dateRangeType = 'all_upcoming';

  if (q.includes('assignment')) category = 'assignment';
  else if (q.includes('exam')) category = 'exam';
  else if (q.includes('payment') || q.includes('fee')) category = 'payment';
  else if (q.includes('registration')) category = 'registration';
  else if (q.includes('scholarship')) category = 'scholarship';
  else if (q.includes('event')) category = 'event';
  else if (q.includes('opportunity') || q.includes('hackathon')) category = 'opportunity';

  if (q.includes('critical') || q.includes('urgent') || q.includes('mandatory')) priority = 'critical';
  else if (q.includes('important')) priority = 'important';

  if (q.includes('hackathon') || q.includes('saved about') || q.includes('what did i save') || q.includes('tell me about')) {
    searchType = 'keyword';
  }

  return {
    searchType,
    category,
    priority,
    dateRangeType,
    searchTerm: query.replace(/what|do|i|have|did|save|about|the|in|next|this|show|me/gi, '').trim(),
    requireAction: q.includes('to do') || q.includes('pending') || q.includes('action'),
    requireConfirmationOnly: q.includes('confirm'),
    summaryFocus: 'general'
  };
}

export function getFallbackIntent(query = '') {
  return {
    searchType: 'structured',
    category: null,
    priority: null,
    dateRangeType: 'none',
    searchTerm: String(query).trim(),
    requireAction: false,
    requireConfirmationOnly: false,
    summaryFocus: 'general'
  };
}

export const IntentParser = {
  parseIntent,
  ruleBasedParse,
  getFallbackIntent
};
