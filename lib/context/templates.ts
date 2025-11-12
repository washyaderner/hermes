import { ContextTemplate, ContextField } from "@/types";
import { generateId } from "@/lib/utils";

// Codebase Context Template
const codebaseFields: ContextField[] = [
  {
    fieldId: "language",
    fieldName: "Programming Language",
    fieldValue: "",
    isRequired: true,
    placeholder: "e.g., TypeScript, Python, Rust",
    tokenWeight: 0.9,
  },
  {
    fieldId: "framework",
    fieldName: "Framework/Library",
    fieldValue: "",
    isRequired: false,
    placeholder: "e.g., React, Next.js, Django",
    tokenWeight: 0.8,
  },
  {
    fieldId: "conventions",
    fieldName: "Code Conventions",
    fieldValue: "",
    isRequired: false,
    placeholder: "e.g., camelCase, functional style, ESLint rules",
    tokenWeight: 0.6,
  },
  {
    fieldId: "architecture",
    fieldName: "Architecture Pattern",
    fieldValue: "",
    isRequired: false,
    placeholder: "e.g., MVC, Component-based, Microservices",
    tokenWeight: 0.5,
  },
  {
    fieldId: "version",
    fieldName: "Version/Stack",
    fieldValue: "",
    isRequired: false,
    placeholder: "e.g., Node 18, React 18, Python 3.11",
    tokenWeight: 0.4,
  },
];

export const codebaseTemplate: ContextTemplate = {
  templateId: "context-codebase",
  templateName: "Codebase Context",
  templateType: "codebase",
  description: "Define your technical stack and coding conventions",
  icon: "💻",
  fields: codebaseFields,
  compressedFormat: "Lang:{language}|Fmwk:{framework}|Conv:{conventions}|Arch:{architecture}|Ver:{version}",
  exampleContext: "Lang:TypeScript|Fmwk:Next.js 14|Conv:Functional, ESLint Airbnb|Arch:Component-based|Ver:Node 18, React 18",
  applicableIntents: ["code", "data_processing"],
};

// Brand Voice Context Template
const brandVoiceFields: ContextField[] = [
  {
    fieldId: "tone",
    fieldName: "Brand Tone",
    fieldValue: "",
    isRequired: true,
    placeholder: "e.g., Professional yet friendly, Bold and innovative",
    tokenWeight: 0.9,
  },
  {
    fieldId: "values",
    fieldName: "Core Values",
    fieldValue: "",
    isRequired: true,
    placeholder: "e.g., Innovation, Transparency, Customer-first",
    tokenWeight: 0.8,
  },
  {
    fieldId: "audience",
    fieldName: "Target Audience",
    fieldValue: "",
    isRequired: false,
    placeholder: "e.g., Tech-savvy millennials, Enterprise CTOs",
    tokenWeight: 0.7,
  },
  {
    fieldId: "avoid",
    fieldName: "Words/Phrases to Avoid",
    fieldValue: "",
    isRequired: false,
    placeholder: "e.g., Jargon, hype words, overpromising",
    tokenWeight: 0.6,
  },
  {
    fieldId: "examples",
    fieldName: "Example Copy",
    fieldValue: "",
    isRequired: false,
    placeholder: "Paste a sample of your best brand copy",
    tokenWeight: 0.5,
  },
];

export const brandVoiceTemplate: ContextTemplate = {
  templateId: "context-brand-voice",
  templateName: "Brand Voice",
  templateType: "brand-voice",
  description: "Define your brand's tone, values, and messaging style",
  icon: "🎨",
  fields: brandVoiceFields,
  compressedFormat: "Tone:{tone}|Values:{values}|Audience:{audience}|Avoid:{avoid}",
  exampleContext: "Tone:Professional yet approachable|Values:Innovation, transparency, customer success|Audience:Tech leaders and product teams|Avoid:Hype, jargon, overpromising",
  applicableIntents: ["creative", "conversation"],
};

// Academic Context Template
const academicFields: ContextField[] = [
  {
    fieldId: "field",
    fieldName: "Academic Field",
    fieldValue: "",
    isRequired: true,
    placeholder: "e.g., Computer Science, Psychology, Economics",
    tokenWeight: 0.9,
  },
  {
    fieldId: "citationStyle",
    fieldName: "Citation Style",
    fieldValue: "",
    isRequired: true,
    placeholder: "e.g., APA 7th, MLA, Chicago, IEEE",
    tokenWeight: 0.8,
  },
  {
    fieldId: "audience",
    fieldName: "Academic Audience",
    fieldValue: "",
    isRequired: false,
    placeholder: "e.g., Peer researchers, Undergraduates, General public",
    tokenWeight: 0.7,
  },
  {
    fieldId: "rigor",
    fieldName: "Rigor Level",
    fieldValue: "",
    isRequired: false,
    placeholder: "e.g., High (journal), Medium (conference), Accessible (blog)",
    tokenWeight: 0.6,
  },
  {
    fieldId: "methodology",
    fieldName: "Methodology",
    fieldValue: "",
    isRequired: false,
    placeholder: "e.g., Quantitative, Qualitative, Mixed methods",
    tokenWeight: 0.5,
  },
];

export const academicTemplate: ContextTemplate = {
  templateId: "context-academic",
  templateName: "Academic Context",
  templateType: "academic",
  description: "Set academic field, citation style, and rigor expectations",
  icon: "🎓",
  fields: academicFields,
  compressedFormat: "Field:{field}|Cite:{citationStyle}|Aud:{audience}|Rigor:{rigor}|Method:{methodology}",
  exampleContext: "Field:Computer Science|Cite:IEEE|Aud:Peer researchers|Rigor:High (journal)|Method:Quantitative",
  applicableIntents: ["analysis", "instruction"],
};

// All templates
export const contextTemplates: ContextTemplate[] = [
  codebaseTemplate,
  brandVoiceTemplate,
  academicTemplate,
];

// Helper to get template by ID
export function getContextTemplateById(templateId: string): ContextTemplate | undefined {
  return contextTemplates.find((t) => t.templateId === templateId);
}

// Helper to get templates by intent
export function getContextTemplatesByIntent(intent: string): ContextTemplate[] {
  return contextTemplates.filter((t) =>
    t.applicableIntents.includes(intent as any)
  );
}
