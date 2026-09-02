import { CATEGORIES, PRIORITIES, RELEVANCE_CATEGORIES } from '../../models/SnapItem.js';

const AMBIGUOUS_PHRASES = [
  'friday', 'monday', 'tuesday', 'wednesday', 'thursday', 'saturday', 'sunday',
  'next week', 'tomorrow', 'this weekend', 'upcoming', 'soon', 'end of month',
  'end of semester', 'tba', 'tbd', 'to be announced', 'before midnight', 'later'
];

export function validateAndSanitize(extractedData, userCaption = '') {
  const title = (extractedData.title || '').trim().slice(0, 200) || 'Untitled Memory';
  const description = (extractedData.description || '').trim();
  const category = CATEGORIES.includes(extractedData.category) ? extractedData.category : 'other';
  const subject = (extractedData.subject || '').trim();
  const action = (extractedData.action || '').trim();
  const priority = PRIORITIES.includes(extractedData.priority) ? extractedData.priority : 'informational';
  const relevance = (extractedData.relevance || '').trim();
  const relevanceCategory = RELEVANCE_CATEGORIES.includes(extractedData.relevanceCategory)
    ? extractedData.relevanceCategory
    : inferRelevanceCategory(category, userCaption);

  let confidence = typeof extractedData.confidence === 'number'
    ? Math.min(Math.max(extractedData.confidence, 0), 1)
    : 0.8;

  let needsConfirmation = Boolean(extractedData.needsConfirmation);
  let confirmationReason = extractedData.confirmationReason || null;
  let deadline = null;
  let date = null;
  let time = (extractedData.time || '').trim();

  const parseSafeDate = (val) => {
    if (!val) return null;
    if (typeof val === 'string') {
      const lower = val.toLowerCase().trim();
      const isAmbiguous = AMBIGUOUS_PHRASES.some(phrase => lower === phrase || lower.startsWith(phrase));
      if (isAmbiguous && !/\d{4}/.test(lower) && !/\d{1,2}[\/\-\.]\d{1,2}/.test(lower)) {
        return { isAmbiguous: true, raw: val };
      }
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) {
        return { date: parsed };
      }
    } else if (val instanceof Date && !isNaN(val.getTime())) {
      return { date: val };
    }
    return { isAmbiguous: true, raw: String(val) };
  };

  if (extractedData.deadline) {
    const parsedDeadline = parseSafeDate(extractedData.deadline);
    if (parsedDeadline.isAmbiguous) {
      needsConfirmation = true;
      deadline = null;
      confirmationReason = confirmationReason || `Notice mentions a relative date ('${parsedDeadline.raw}'). Please verify the exact calendar deadline.`;
      confidence = Math.min(confidence, 0.55);
    } else if (parsedDeadline.date) {
      deadline = parsedDeadline.date;
    }
  }

  if (extractedData.date) {
    const parsedDate = parseSafeDate(extractedData.date);
    if (parsedDate.isAmbiguous) {
      needsConfirmation = true;
      date = null;
      confirmationReason = confirmationReason || `Event date ('${parsedDate.raw}') is relative or uncertain.`;
      confidence = Math.min(confidence, 0.55);
    } else if (parsedDate.date) {
      date = parsedDate.date;
    }
  }

  const actionRequiredCategories = ['assignment', 'exam', 'payment', 'registration'];
  if (actionRequiredCategories.includes(category) && !action) {
    needsConfirmation = true;
    confirmationReason = confirmationReason || `Notice appears to be a ${category} without a clear action step. Please verify.`;
    confidence = Math.min(confidence, 0.6);
  }

  if (title === 'Untitled Memory' || title.length < 4) {
    needsConfirmation = true;
    confirmationReason = confirmationReason || 'Could not extract a clear title. Please give this item a title.';
    confidence = Math.min(confidence, 0.5);
  }

  if (!needsConfirmation && (deadline || date) && action && title.length > 5) {
    confidence = Math.max(confidence, 0.9);
  }

  return {
    title,
    description,
    category,
    subject,
    deadline,
    date,
    time,
    action,
    priority,
    relevance,
    relevanceCategory,
    confidence,
    needsConfirmation,
    confirmationReason
  };
}

export function inferRelevanceCategory(category, userCaption = '') {
  const text = `${category} ${userCaption}`.toLowerCase();
  if (['assignment', 'exam', 'schedule'].includes(category) || /course|class|study|prof|homework/i.test(text)) {
    return 'academic';
  }
  if (category === 'payment' || /fee|tuition|scholarship|grant|money|bank/i.test(text)) {
    return 'financial';
  }
  if (category === 'opportunity' || /hackathon|internship|contest|job|career/i.test(text)) {
    return 'opportunity';
  }
  if (category === 'registration' || category === 'announcement' || /circular|admin|college|office|notice/i.test(text)) {
    return 'administrative';
  }
  if (/my|personal|reminder|friend/i.test(text)) {
    return 'personal';
  }
  return 'general';
}

export const AmbiguityDetector = {
  validateAndSanitize,
  inferRelevanceCategory
};
