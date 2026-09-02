import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { config } from '../../config/env.js';
import { validateAndSanitize } from './ambiguityDetector.js';

const singleItemSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(''),
  category: z.enum([
    'assignment',
    'exam',
    'payment',
    'registration',
    'event',
    'schedule',
    'scholarship',
    'announcement',
    'opportunity',
    'task',
    'other'
  ]).default('other'),
  subject: z.string().optional().default(''),
  deadline: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  time: z.string().optional().default(''),
  action: z.string().optional().default(''),
  priority: z.enum(['critical', 'important', 'informational']).default('informational'),
  relevance: z.string().optional().default(''),
  relevanceCategory: z.enum(['academic', 'financial', 'personal', 'opportunity', 'administrative', 'general']).optional().default('general'),
  confidence: z.number().min(0).max(1).optional().default(0.8),
  needsConfirmation: z.boolean().optional().default(false),
  confirmationReason: z.string().nullable().optional()
});

export async function extractFromScreenshot(imageBuffer, mimeType = 'image/jpeg', userCaption = '') {
  if (!config.geminiApiKey) {
    console.warn('GEMINI_API_KEY is not set. Using mock multi-item extraction for local testing.');
    return generateMockExtraction(userCaption);
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: config.geminiModel || 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const prompt = `You are SnapKeep's Vision Extractor for students.
Extract all distinct actionable memories from this notice/circular screenshot.

Context provided by student: "${userCaption || 'None'}"

Rules:
1. MULTIPLE ITEMS: If a circular contains multiple distinct events, fees, or deadlines, extract each as a separate item.
2. Ignore decorative college letterheads, stamps, and legal disclaimers.
3. If dates are relative (e.g. "submit by next Friday"), leave deadline as null and mark needsConfirmation: true with confirmationReason.
4. Set priority: critical (mandatory/high-stakes), important (time-sensitive), informational (general notice).

Return JSON:
{
  "items": [
    {
      "title": string,
      "description": string,
      "category": "assignment" | "exam" | "payment" | "registration" | "event" | "schedule" | "scholarship" | "announcement" | "opportunity" | "task" | "other",
      "subject": string,
      "deadline": string | null,
      "date": string | null,
      "time": string,
      "action": string,
      "priority": "critical" | "important" | "informational",
      "relevance": string,
      "relevanceCategory": "academic" | "financial" | "personal" | "opportunity" | "administrative" | "general",
      "confidence": number,
      "needsConfirmation": boolean,
      "confirmationReason": string | null
    }
  ]
}`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    let parsedJson;
    try {
      parsedJson = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse Gemini output as JSON:', responseText);
      throw new Error('Vision extraction did not return structured JSON.');
    }

    let rawItems = [];
    if (Array.isArray(parsedJson)) {
      rawItems = parsedJson;
    } else if (parsedJson && Array.isArray(parsedJson.items)) {
      rawItems = parsedJson.items;
    } else if (parsedJson && typeof parsedJson === 'object') {
      rawItems = [parsedJson];
    }

    if (rawItems.length === 0) {
      throw new Error('No actionable items identified in image.');
    }

    return rawItems.map((item) => {
      const validated = singleItemSchema.safeParse(item);
      const dataToSanitize = validated.success ? validated.data : item;
      return validateAndSanitize(dataToSanitize, userCaption);
    });
  } catch (error) {
    console.error('Gemini Vision extraction error:', error.message);
    return [
      validateAndSanitize({
        title: userCaption ? `Screenshot: ${userCaption.slice(0, 50)}` : 'Captured Notice',
        description: 'Unable to automatically parse text from screenshot. Please verify details manually.',
        category: 'other',
        subject: '',
        deadline: null,
        date: null,
        time: '',
        action: 'Review and confirm circular details',
        priority: 'important',
        relevance: userCaption || 'Captured notice',
        relevanceCategory: 'general',
        confidence: 0.3,
        needsConfirmation: true,
        confirmationReason: `Vision parser encountered an issue: ${error.message}`
      }, userCaption)
    ];
  }
}

export function generateMockExtraction(userCaption = '') {
  const isAmbiguous = /friday|tomorrow|next week|soon/i.test(userCaption);
  const isMulti = /and|both|multiple|also|plus/i.test(userCaption);

  const item1 = validateAndSanitize({
    title: userCaption ? `Item: ${userCaption}` : 'Academic Notification',
    description: 'Extracted academic announcement and instructions.',
    category: /assign/i.test(userCaption) ? 'assignment' : /fee|pay/i.test(userCaption) ? 'payment' : 'announcement',
    subject: /se|software/i.test(userCaption) ? 'Software Engineering' : '',
    deadline: isAmbiguous ? null : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    date: null,
    time: '11:59 PM',
    action: 'Complete and submit requirement',
    priority: /mandatory|exam|critical/i.test(userCaption) ? 'critical' : 'important',
    relevance: userCaption || 'Extracted from uploaded screenshot',
    relevanceCategory: /fee|pay/i.test(userCaption) ? 'financial' : 'academic',
    confidence: isAmbiguous ? 0.55 : 0.95,
    needsConfirmation: isAmbiguous,
    confirmationReason: isAmbiguous ? 'Exact date could not be determined deterministically.' : null
  }, userCaption);

  if (isMulti) {
    const item2 = validateAndSanitize({
      title: 'Semester Fee Due',
      description: 'Payment notice included in circular.',
      category: 'payment',
      subject: '',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      date: null,
      time: '5:00 PM',
      action: 'Pay semester fee online',
      priority: 'critical',
      relevance: 'College fee requirement',
      relevanceCategory: 'financial',
      confidence: 0.9,
      needsConfirmation: false,
      confirmationReason: null
    }, userCaption);

    return [item1, item2];
  }

  return [item1];
}

export const VisionExtractor = {
  extractFromScreenshot,
  generateMockExtraction
};
