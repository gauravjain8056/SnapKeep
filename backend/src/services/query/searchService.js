import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SnapItem } from '../../models/SnapItem.js';
import { config } from '../../config/env.js';

export async function searchUserItems(userId, queryText, intent, limit = 20) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const baseQuery = { userId: userObjectId };

  if (intent.category) {
    baseQuery.category = intent.category;
  }

  if (intent.priority) {
    baseQuery.priority = intent.priority;
  }

  if (intent.requireConfirmationOnly) {
    baseQuery.needsConfirmation = true;
  }

  const searchTerm = (intent.searchTerm || queryText || '').trim();

  if (searchTerm && intent.searchType !== 'structured') {
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedTerm, 'i');

    baseQuery.$or = [
      { title: regex },
      { description: regex },
      { subject: regex },
      { action: regex },
      { originalCaption: regex }
    ];
  }

  try {
    const items = await SnapItem.find(baseQuery)
      .sort({ deadline: 1, priority: 1, createdAt: -1 })
      .limit(limit)
      .lean();

    return items;
  } catch (err) {
    console.error('Error executing search query:', err);
    throw err;
  }
}

export async function synthesizeAnswer(userQuery, items) {
  if (!items || items.length === 0) {
    return `I couldn't find any saved notices or reminders matching "${userQuery}". Try asking by subject, category, or checking your dashboard.`;
  }

  if (!config.geminiApiKey) {
    return generateDeterministicSummary(userQuery, items);
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: config.geminiModel || 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 300
      }
    });

    const contextData = items.slice(0, 8).map((item, idx) => ({
      index: idx + 1,
      title: item.title,
      category: item.category,
      subject: item.subject || 'N/A',
      deadline: item.deadline ? new Date(item.deadline).toLocaleString() : 'No explicit date',
      action: item.action,
      priority: item.priority,
      needsConfirmation: item.needsConfirmation ? `(Unconfirmed: ${item.confirmationReason})` : 'Confirmed'
    }));

    const prompt = `You are SnapKeep's assistant for students. A student asked: "${userQuery}".
Here are their relevant saved items:
${JSON.stringify(contextData, null, 2)}

Provide a direct, friendly 1 to 3 sentence answer addressing their question clearly. Highlight urgent deadlines or actions. If details need confirmation, mention it briefly. Do not include markdown tables or JSON.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn('AI Answer synthesis failed, falling back to deterministic summary:', err.message);
    return generateDeterministicSummary(userQuery, items);
  }
}

export function generateDeterministicSummary(query, items) {
  const count = items.length;
  const topItem = items[0];
  const deadlineStr = topItem.deadline
    ? `due by ${new Date(topItem.deadline).toLocaleDateString()}`
    : 'no strict deadline specified';

  if (count === 1) {
    return `Found 1 item for your query: "${topItem.title}" (${deadlineStr}). Required action: ${topItem.action || 'Check details in dashboard'}.`;
  }

  return `Found ${count} matching items. Most urgent is "${topItem.title}" (${deadlineStr}). Review your retrieved items below for full details.`;
}
