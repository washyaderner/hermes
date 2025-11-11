import { BatchTemplate } from "@/types";

// Pre-built batch processing templates for common use cases
export const batchTemplates: BatchTemplate[] = [
  {
    templateId: "email-personalization",
    templateName: "Email Personalization",
    templateDescription: "Generate personalized emails from a base template with custom variables",
    category: "Marketing",
    icon: "📧",
    basePromptTemplate: "Write a personalized email to {name} from {company} about {topic}. Tone: {tone}. Include their specific interest in {interest}.",
    requiredVariables: ["name", "company", "topic", "tone", "interest"],
    exampleCsv: `name,company,topic,tone,interest
John Smith,Acme Corp,new product launch,professional,automation
Jane Doe,TechStart,partnership opportunity,friendly,AI technology
Bob Johnson,MegaCo,quarterly update,formal,cost savings`,
    useCases: [
      "Cold outreach campaigns",
      "Customer onboarding emails",
      "Personalized newsletters",
      "Sales follow-ups",
    ],
  },
  {
    templateId: "product-descriptions",
    templateName: "Product Descriptions",
    templateDescription: "Transform product features into compelling marketing copy",
    category: "E-commerce",
    icon: "🛍️",
    basePromptTemplate: "Create a compelling product description for {product_name}. Key features: {features}. Target audience: {audience}. Price point: {price}. Highlight the unique selling proposition: {usp}.",
    requiredVariables: ["product_name", "features", "audience", "price", "usp"],
    exampleCsv: `product_name,features,audience,price,usp
Wireless Earbuds Pro,"Active noise cancellation, 30hr battery, waterproof",professionals,$199,Best ANC in class
Smart Home Hub,"Voice control, 50+ integrations, energy monitoring",homeowners,$149,Easiest setup on market
Fitness Tracker Elite,"Heart rate, sleep tracking, GPS, 7-day battery",fitness enthusiasts,$129,Medical-grade accuracy`,
    useCases: [
      "E-commerce product catalogs",
      "Amazon listings",
      "Shopify store updates",
      "Product launch descriptions",
    ],
  },
  {
    templateId: "test-data-generation",
    templateName: "Test Data Generation",
    templateDescription: "Generate realistic test data from schema specifications",
    category: "Development",
    icon: "🧪",
    basePromptTemplate: "Generate realistic test data for {entity_type}. Required fields: {fields}. Data constraints: {constraints}. Format: {format}. Generate {count} examples.",
    requiredVariables: ["entity_type", "fields", "constraints", "format", "count"],
    exampleCsv: `entity_type,fields,constraints,format,count
User Profile,"name, email, age, city","age 18-65, valid email","JSON",5
Product Inventory,"sku, name, price, quantity","price > 0, quantity integer","CSV",10
Order Record,"order_id, customer, items, total","total matches items, valid date","JSON",3`,
    useCases: [
      "API testing",
      "Database seeding",
      "QA test scenarios",
      "Demo data creation",
    ],
  },
  {
    templateId: "social-media-variations",
    templateName: "Social Media Variations",
    templateDescription: "Create platform-specific variations of the same message",
    category: "Social Media",
    icon: "📱",
    basePromptTemplate: "Adapt this message for {platform}: {core_message}. Target: {target_audience}. Include: {cta}. Tone: {tone}.",
    requiredVariables: ["platform", "core_message", "target_audience", "cta", "tone"],
    exampleCsv: `platform,core_message,target_audience,cta,tone
Twitter,Launching our new AI feature next week,developers,Visit our site for early access,exciting
LinkedIn,Announcing Q4 product updates,business professionals,Read the full announcement,professional
Instagram,Behind the scenes of our latest project,creative professionals,Swipe to see more,casual`,
    useCases: [
      "Multi-platform campaigns",
      "Content repurposing",
      "A/B testing variations",
      "Social media scheduling",
    ],
  },
  {
    templateId: "qa-answer-generation",
    templateName: "Q&A Answer Generation",
    templateDescription: "Generate consistent answers to frequently asked questions",
    category: "Customer Support",
    icon: "❓",
    basePromptTemplate: "Answer this customer question: {question}. Context: {context}. Company policy: {policy}. Tone: {tone}.",
    requiredVariables: ["question", "context", "policy", "tone"],
    exampleCsv: `question,context,policy,tone
What is your return policy?,Online purchase within 30 days,Full refund with receipt,helpful
How long does shipping take?,Standard domestic orders,3-5 business days,friendly
Do you offer bulk discounts?,B2B inquiry,10% off orders over $1000,professional`,
    useCases: [
      "FAQ page generation",
      "Chatbot training",
      "Support documentation",
      "Knowledge base creation",
    ],
  },
];

/**
 * Parse CSV string into array of objects
 */
export function parseCsvToBatchItems(
  csvString: string,
  templateId?: string
): Array<{
  prompt: string;
  variables: Record<string, string>;
  rowNumber: number;
}> {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());

  // Parse data rows
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());

    if (values.length !== headers.length) {
      console.warn(`Row ${i + 1} has ${values.length} values but expected ${headers.length}. Skipping.`);
      continue;
    }

    const variables: Record<string, string> = {};
    headers.forEach((header, index) => {
      variables[header] = values[index];
    });

    // Build prompt from variables if template exists
    let prompt = "";
    if (templateId) {
      const template = batchTemplates.find(t => t.templateId === templateId);
      if (template) {
        prompt = template.basePromptTemplate;
        Object.entries(variables).forEach(([key, value]) => {
          prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        });
      }
    } else {
      // If no template, use first column as prompt
      prompt = values[0];
    }

    results.push({
      prompt,
      variables,
      rowNumber: i + 1,
    });
  }

  return results;
}

/**
 * Generate example CSV for a template
 */
export function getTemplateExampleCsv(templateId: string): string {
  const template = batchTemplates.find(t => t.templateId === templateId);
  return template?.exampleCsv || "";
}

/**
 * Validate CSV headers match template requirements
 */
export function validateCsvHeaders(
  csvString: string,
  templateId: string
): { valid: boolean; missingHeaders: string[]; message: string } {
  const template = batchTemplates.find(t => t.templateId === templateId);
  if (!template) {
    return {
      valid: false,
      missingHeaders: [],
      message: "Template not found",
    };
  }

  const lines = csvString.trim().split('\n');
  if (lines.length === 0) {
    return {
      valid: false,
      missingHeaders: template.requiredVariables,
      message: "CSV is empty",
    };
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = template.requiredVariables.map(v => v.toLowerCase());

  const missingHeaders = requiredHeaders.filter(req => !headers.includes(req));

  if (missingHeaders.length > 0) {
    return {
      valid: false,
      missingHeaders,
      message: `Missing required columns: ${missingHeaders.join(', ')}`,
    };
  }

  return {
    valid: true,
    missingHeaders: [],
    message: "CSV headers valid",
  };
}
