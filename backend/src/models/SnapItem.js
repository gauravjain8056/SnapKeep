import mongoose from 'mongoose';

export const CATEGORIES = [
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
];

export const PRIORITIES = ['critical', 'important', 'informational'];

export const RELEVANCE_CATEGORIES = [
  'academic',
  'financial',
  'personal',
  'opportunity',
  'administrative',
  'general'
];

const snapItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'other',
      index: true
    },
    subject: {
      type: String,
      default: '',
      trim: true
    },
    deadline: {
      type: Date,
      default: null,
      index: true
    },
    date: {
      type: Date,
      default: null
    },
    time: {
      type: String,
      default: '',
      trim: true
    },
    action: {
      type: String,
      default: '',
      trim: true
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'informational',
      index: true
    },
    relevance: {
      type: String,
      default: '',
      trim: true
    },
    relevanceCategory: {
      type: String,
      enum: RELEVANCE_CATEGORIES,
      default: 'general',
      index: true
    },
    originalCaption: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000
    },
    sourceType: {
      type: String,
      default: 'screenshot'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1.0
    },
    needsConfirmation: {
      type: Boolean,
      default: false,
      index: true
    },
    confirmationReason: {
      type: String,
      default: null
    },
    processing: {
      aiModel: {
        type: String,
        default: ''
      },
      processedAt: {
        type: Date,
        default: Date.now
      }
    },
    retention: {
      status: {
        type: String,
        enum: ['active', 'retention'],
        default: 'active',
        index: true
      },
      expiresAt: {
        type: Date,
        default: null,
        index: true
      },
      extendedCount: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

snapItemSchema.index({ userId: 1, deadline: 1 });
snapItemSchema.index({ userId: 1, category: 1 });
snapItemSchema.index({ userId: 1, priority: 1 });
snapItemSchema.index({ userId: 1, relevanceCategory: 1 });
snapItemSchema.index({ userId: 1, 'retention.status': 1, 'retention.expiresAt': 1 });
snapItemSchema.index({ userId: 1, needsConfirmation: 1 });
snapItemSchema.index({ userId: 1, createdAt: -1 });

snapItemSchema.index({
  title: 'text',
  description: 'text',
  subject: 'text',
  action: 'text',
  originalCaption: 'text'
});

export const SnapItem = mongoose.model('SnapItem', snapItemSchema);
