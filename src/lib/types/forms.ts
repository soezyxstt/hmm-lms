// types/form.ts

import type { JsonValue } from '@prisma/client/runtime/library';
import { z } from "zod";

export const FormQuestionType = z.enum([
  "SHORT_ANSWER",
  "LONG_ANSWER",
  "MULTIPLE_CHOICE",
  "MULTIPLE_SELECT",
  "FILE_UPLOAD",
  "NAME_SELECT",
  "NIM_SELECT",
  "RATING",
  "DATE",
  "TIME",
  "COURSE_SELECT",
  "EVENT_SELECT",
]);

export type FormQuestionType = z.infer<typeof FormQuestionType>;

// Base question interface
export interface BaseQuestionSettings {
  placeholder?: string;
  helperText?: string;
}

// Specific question settings
export interface MultipleChoiceSettings extends BaseQuestionSettings {
  options: Array<{
    id: string;
    text: string;
    value: string;
  }>;
  allowOther?: boolean;
}

export interface MultipleSelectSettings extends BaseQuestionSettings {
  options: Array<{
    id: string;
    text: string;
    value: string;
  }>;
  minSelections?: number;
  maxSelections?: number;
  allowOther?: boolean;
}

export interface FileUploadSettings extends BaseQuestionSettings {
  allowedFileTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
}

export interface RatingSettings extends BaseQuestionSettings {
  scale: number; // e.g., 5 for 1-5 scale
  lowLabel?: string;
  highLabel?: string;
  icon?: "star" | "heart" | "thumbs" | "numbers";
}

export interface TextSettings extends BaseQuestionSettings {
  minLength?: number;
  maxLength?: number;
  pattern?: string; // regex pattern
}

export interface DateTimeSettings extends BaseQuestionSettings {
  minDate?: string;
  maxDate?: string;
  includeTime?: boolean;
}

// Union type for all settings
export type QuestionSettings =
  | MultipleChoiceSettings
  | MultipleSelectSettings
  | FileUploadSettings
  | RatingSettings
  | TextSettings
  | DateTimeSettings
  | BaseQuestionSettings;

// Zod schemas for validation
export const baseQuestionSettingsSchema = z.object({
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
});

export const multipleChoiceSettingsSchema = baseQuestionSettingsSchema.extend({
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        value: z.string(),
      }),
    )
    .min(1),
  allowOther: z.boolean().optional(),
});

export const multipleSelectSettingsSchema = baseQuestionSettingsSchema.extend({
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        value: z.string(),
      }),
    )
    .min(1),
  minSelections: z.number().min(0).optional(),
  maxSelections: z.number().min(1).optional(),
  allowOther: z.boolean().optional(),
});

export const fileUploadSettingsSchema = baseQuestionSettingsSchema.extend({
  allowedFileTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().min(1).optional(),
  maxFiles: z.number().min(1).optional(),
});

export const ratingSettingsSchema = baseQuestionSettingsSchema.extend({
  scale: z.number().min(2).max(10),
  lowLabel: z.string().optional(),
  highLabel: z.string().optional(),
  icon: z.enum(["star", "heart", "thumbs", "numbers"]).optional(),
});

export const textSettingsSchema = baseQuestionSettingsSchema.extend({
  minLength: z.number().min(0).optional(),
  maxLength: z.number().min(1).optional(),
  pattern: z.string().optional(),
});

export const dateTimeSettingsSchema = baseQuestionSettingsSchema.extend({
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
  includeTime: z.boolean().optional(),
});

// Form schemas
export const createFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  allowMultipleSubmissions: z.boolean().default(false),
  requireAuth: z.boolean().default(true),
  showProgressBar: z.boolean().default(true),
  collectEmail: z.boolean().default(true),
});

export const updateFormSchema = createFormSchema.partial().extend({
  id: z.string(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createQuestionSchema = z.object({
  formId: z.string(),
  title: z.string().min(1, "Question title is required"),
  description: z.string().optional(),
  type: FormQuestionType,
  required: z.boolean().default(false),
  order: z.number().int().min(0),
  settings: z.any().optional(), // Will be validated based on type
});

export const updateQuestionSchema = createQuestionSchema.partial().extend({
  id: z.string(),
});

export const submitFormSchema = z.object({
  formId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      textValue: z.string().optional(),
      numberValue: z.number().optional(),
      dateValue: z.date().optional(),
      jsonValue: z.any().optional(),
      fileUrl: z.string().optional(),
    }),
  ),
});

// Response types
export interface FormWithQuestions {
  id: string;
  title: string;
  description?: string;
  isPublished: boolean;
  isActive: boolean;
  allowMultipleSubmissions: boolean;
  requireAuth: boolean;
  showProgressBar: boolean;
  collectEmail: boolean;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  questions: Array<{
    id: string;
    title: string;
    description?: string;
    type: FormQuestionType;
    required: boolean;
    order: number;
    settings?: QuestionSettings;
  }>;
}

export interface FormSubmissionWithAnswers {
  id: string;
  submittedAt: Date;
  submitter?: {
    id: string;
    name: string;
    email: string;
    nim?: string;
  };
  answers: Array<{
    id: string;
    question: {
      id: string;
      title: string;
      type: FormQuestionType;
    };
    textValue?: string;
    numberValue?: number;
    dateValue?: Date;
    jsonValue?: JsonValue;
    fileUrl?: string;
  }>;
}

// Question type metadata
export const QUESTION_TYPE_CONFIG = {
  SHORT_ANSWER: {
    label: "Short Answer",
    description: "Brief text response",
    icon: "Type",
    category: "text",
  },
  LONG_ANSWER: {
    label: "Long Answer",
    description: "Paragraph text response",
    icon: "AlignLeft",
    category: "text",
  },
  MULTIPLE_CHOICE: {
    label: "Multiple Choice",
    description: "Select one option",
    icon: "Circle",
    category: "choice",
  },
  MULTIPLE_SELECT: {
    label: "Multiple Select",
    description: "Select multiple options",
    icon: "Square",
    category: "choice",
  },
  FILE_UPLOAD: {
    label: "File Upload",
    description: "Upload files",
    icon: "Upload",
    category: "media",
  },
  NAME_SELECT: {
    label: "Name Select",
    description: "Select from user names",
    icon: "User",
    category: "database",
  },
  NIM_SELECT: {
    label: "NIM Select",
    description: "Select from student IDs",
    icon: "CreditCard",
    category: "database",
  },
  RATING: {
    label: "Rating",
    description: "Rating scale response",
    icon: "Star",
    category: "scale",
  },
  DATE: {
    label: "Date",
    description: "Date picker",
    icon: "Calendar",
    category: "datetime",
  },
  TIME: {
    label: "Time",
    description: "Time picker",
    icon: "Clock",
    category: "datetime",
  },
  COURSE_SELECT: {
    label: "Course Select",
    description: "Select from courses",
    icon: "BookOpen",
    category: "database",
  },
  EVENT_SELECT: {
    label: "Event Select",
    description: "Select from events",
    icon: "CalendarDays",
    category: "database",
  },
} as const;
