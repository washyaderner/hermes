import { ConnectionTemplate } from "@/types";

/**
 * Connection Templates for MCP Integration
 *
 * Pre-built templates for common MCP server connections and use cases
 */

// ============================================================================
// Cursor MCP Templates
// ============================================================================

export const cursorFileOperations: ConnectionTemplate = {
  templateId: "cursor-file-ops",
  name: "Cursor File Operations",
  description: "Read, write, and manage files through Cursor MCP",
  category: "filesystem",
  serverType: "cursor-mcp",
  promptTemplate: `Task: {task}

Available Tools:
- read_file: Read file contents
- write_file: Create or update files
- list_files: List directory contents

File Paths:
{file_paths}

Instructions:
{instructions}`,
  examples: [
    {
      title: "Read and analyze a file",
      prompt: `Read the file at src/components/Button.tsx and analyze its implementation.

File Paths:
- src/components/Button.tsx

Instructions:
1. Read the file contents
2. Identify the component structure
3. Suggest improvements`,
      explanation: "Specifies exact file path and clear analysis steps",
    },
    {
      title: "Create a new utility file",
      prompt: `Create a new file at src/utils/validation.ts with input validation helpers.

Instructions:
1. Create functions for email, phone, and password validation
2. Include TypeScript types
3. Add JSDoc comments`,
      explanation: "Clear file path and detailed content requirements",
    },
    {
      title: "Refactor multiple files",
      prompt: `Refactor the authentication logic across multiple files.

File Paths:
- src/auth/login.ts
- src/auth/register.ts
- src/auth/middleware.ts

Instructions:
1. Extract common patterns
2. Create shared utilities
3. Update imports`,
      explanation: "Multiple file paths with structured refactoring plan",
    },
  ],
  toolRecommendations: ["read_file", "write_file", "list_files"],
  setupInstructions: "Connect Cursor MCP to enable filesystem operations within your workspace.",
};

export const cursorCodeNavigation: ConnectionTemplate = {
  templateId: "cursor-code-nav",
  name: "Cursor Code Navigation",
  description: "Navigate and explore codebase structure",
  category: "filesystem",
  serverType: "cursor-mcp",
  promptTemplate: `Explore: {exploration_goal}

Starting Point:
{starting_path}

Focus Areas:
{focus_areas}

Questions:
{questions}`,
  examples: [
    {
      title: "Understand project structure",
      prompt: `Explore the project structure starting from the src directory.

Focus Areas:
- Component organization
- State management patterns
- Routing setup

Questions:
- How are components structured?
- What state management library is used?
- How is routing configured?`,
      explanation: "Broad exploration with specific focus areas",
    },
    {
      title: "Find feature implementation",
      prompt: `Find how user authentication is implemented.

Starting Point:
src/

Focus Areas:
- Login/signup flows
- Token management
- Protected routes

Questions:
- Where is the auth logic?
- How are tokens stored?
- Which components are protected?`,
      explanation: "Feature-focused exploration with clear questions",
    },
  ],
  toolRecommendations: ["list_files", "read_file"],
  setupInstructions: "Use Cursor MCP to explore your workspace structure and navigate code.",
};

// ============================================================================
// Web Operations Templates
// ============================================================================

export const webSearchResearch: ConnectionTemplate = {
  templateId: "web-search-research",
  name: "Web Search & Research",
  description: "Search the web and fetch information from URLs",
  category: "web",
  serverType: "web-search-mcp",
  promptTemplate: `Research Topic: {topic}

Search Queries:
{queries}

URLs to Fetch:
{urls}

Analysis Goals:
{goals}`,
  examples: [
    {
      title: "Research best practices",
      prompt: `Research React best practices for 2024.

Search Queries:
- "React best practices 2024"
- "React hooks patterns"
- "React performance optimization"

Analysis Goals:
- Identify top 5 recommendations
- Find code examples
- Compare different approaches`,
      explanation: "Multiple search queries with clear analysis goals",
    },
    {
      title: "Fetch documentation",
      prompt: `Fetch and summarize the Next.js App Router documentation.

URLs to Fetch:
- https://nextjs.org/docs/app
- https://nextjs.org/docs/app/building-your-application/routing

Analysis Goals:
- Extract key concepts
- Note important features
- Identify migration steps`,
      explanation: "Specific URLs with structured analysis",
    },
  ],
  toolRecommendations: ["search_web", "fetch_url"],
  setupInstructions: "Connect Web Search MCP to enable web browsing and search capabilities.",
};

// ============================================================================
// Database Operations Templates
// ============================================================================

export const databaseQuery: ConnectionTemplate = {
  templateId: "database-query",
  name: "Database Query Operations",
  description: "Execute SQL queries and inspect database schema",
  category: "database",
  serverType: "database-mcp",
  promptTemplate: `Database Task: {task}

Tables:
{tables}

Query Requirements:
{requirements}

Expected Results:
{expected_results}`,
  examples: [
    {
      title: "Analyze user data",
      prompt: `Query the users table to analyze active user accounts.

Tables:
- users
- user_sessions

Query Requirements:
- Find users active in last 30 days
- Include session count
- Order by last_login DESC

Expected Results:
User ID, email, last login date, session count`,
      explanation: "Clear table specification and query requirements",
    },
    {
      title: "Generate report data",
      prompt: `Generate a sales report from the orders database.

Tables:
- orders
- order_items
- products

Query Requirements:
- Sum total sales by product category
- Filter for last quarter
- Include product names

Expected Results:
Category, total sales, order count, top products`,
      explanation: "Multi-table query with aggregation and filtering",
    },
  ],
  toolRecommendations: ["execute_query", "get_schema"],
  setupInstructions: "Connect Database MCP with your database credentials to enable SQL operations.",
};

export const databaseSchemaExploration: ConnectionTemplate = {
  templateId: "database-schema",
  name: "Database Schema Exploration",
  description: "Explore and understand database structure",
  category: "database",
  serverType: "database-mcp",
  promptTemplate: `Explore Database: {database_name}

Focus:
{focus_tables}

Questions:
{questions}`,
  examples: [
    {
      title: "Understand schema relationships",
      prompt: `Explore the e-commerce database schema.

Focus:
- users table
- orders table
- products table

Questions:
- How are users related to orders?
- What are the foreign key relationships?
- What indexes exist?`,
      explanation: "Schema exploration with relationship focus",
    },
  ],
  toolRecommendations: ["get_schema"],
  setupInstructions: "Use Database MCP to inspect schema structure and relationships.",
};

// ============================================================================
// API Integration Templates
// ============================================================================

export const apiIntegration: ConnectionTemplate = {
  templateId: "api-integration",
  name: "API Integration",
  description: "Call external APIs and process responses",
  category: "api",
  serverType: "api-mcp",
  promptTemplate: `API Task: {task}

Endpoint:
{endpoint}

Method: {method}

Parameters:
{parameters}

Expected Response:
{response_structure}`,
  examples: [
    {
      title: "Fetch data from REST API",
      prompt: `Fetch user data from the GitHub API.

Endpoint:
https://api.github.com/users/{username}

Method: GET

Parameters:
- username: octocat

Expected Response:
JSON with user profile data`,
      explanation: "Clear API endpoint and parameter specification",
    },
  ],
  toolRecommendations: ["api_call"],
  setupInstructions: "Configure API MCP with authentication credentials for external API access.",
};

// ============================================================================
// Template Registry
// ============================================================================

export const ALL_TEMPLATES: ConnectionTemplate[] = [
  cursorFileOperations,
  cursorCodeNavigation,
  webSearchResearch,
  databaseQuery,
  databaseSchemaExploration,
  apiIntegration,
];

export function getTemplateById(templateId: string): ConnectionTemplate | null {
  return ALL_TEMPLATES.find((t) => t.templateId === templateId) || null;
}

export function getTemplatesByCategory(
  category: string
): ConnectionTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplatesByServerType(
  serverType: string
): ConnectionTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.serverType === serverType);
}

/**
 * Fill template with user data
 */
export function fillTemplate(
  template: ConnectionTemplate,
  data: Record<string, string>
): string {
  let filled = template.promptTemplate;

  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    filled = filled.replace(new RegExp(placeholder, "g"), value);
  });

  return filled;
}
