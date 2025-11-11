import {
  SecurityThreat,
  SecurityScanResult,
  SecurityThreatLevel,
  SecurityThreatType,
} from "@/types";
import { generateId } from "@/lib/utils";

/**
 * Security Scanner for Prompt Injection Detection
 *
 * Detects and flags various types of security threats in user prompts
 */

// ============================================================================
// Threat Pattern Definitions
// ============================================================================

interface ThreatPattern {
  type: SecurityThreatType;
  level: SecurityThreatLevel;
  patterns: RegExp[];
  description: string;
  recommendation: string;
}

const THREAT_PATTERNS: ThreatPattern[] = [
  // Prompt Injection Attempts
  {
    type: "prompt-injection",
    level: "high",
    patterns: [
      /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|commands?)/gi,
      /forget\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/gi,
      /disregard\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/gi,
      /ignore\s+everything\s+(before|above|prior)/gi,
      /new\s+instructions?:/gi,
      /system\s*:\s*ignore/gi,
      /override\s+(previous|all)\s+(instructions?|rules?|prompts?)/gi,
    ],
    description: "Attempt to override or ignore system instructions",
    recommendation: "Remove injection attempts and rephrase your prompt clearly",
  },

  // Role Manipulation
  {
    type: "role-manipulation",
    level: "medium",
    patterns: [
      /you\s+are\s+now\s+(a|an)\s+\w+/gi,
      /act\s+as\s+if\s+you\s+(are|were)\s+(a|an)\s+\w+/gi,
      /pretend\s+(you\s+)?(are|to\s+be)\s+(a|an)\s+\w+/gi,
      /from\s+now\s+on,?\s+you\s+(are|will\s+be)\s+(a|an)\s+\w+/gi,
      /simulate\s+(being\s+)?(a|an)\s+\w+/gi,
      /roleplay\s+as\s+(a|an)\s+\w+/gi,
    ],
    description: "Attempt to manipulate AI role or behavior",
    recommendation: "Use proper role definition in system prompts instead",
  },

  // Delimiter Escape Attempts
  {
    type: "delimiter-escape",
    level: "high",
    patterns: [
      /<\/\s*(instructions?|system|context|rules?|prompt)>/gi,
      /\]\s*\]\s*>/gi,
      /\[\s*SYSTEM\s*\]/gi,
      /\[\s*\/\s*INST\s*\]/gi,
      /<\|im_end\|>/gi,
      /<\|endoftext\|>/gi,
    ],
    description: "Attempt to escape XML/instruction delimiters",
    recommendation: "Remove special delimiter characters from your prompt",
  },

  // System Command Injection
  {
    type: "system-command",
    level: "critical",
    patterns: [
      /system\s*:\s*[^\n]+/gi,
      /\[SYSTEM\]\s*[^\n]+/gi,
      /\<system\>[^\<]+\<\/system\>/gi,
      /execute\s+command\s*:/gi,
      /run\s+script\s*:/gi,
      /eval\s*\(/gi,
      /exec\s*\(/gi,
    ],
    description: "Attempt to inject system-level commands",
    recommendation: "Remove system command syntax from your prompt",
  },

  // Jailbreak Attempts
  {
    type: "jailbreak-attempt",
    level: "critical",
    patterns: [
      /DAN\s+mode/gi,
      /developer\s+mode/gi,
      /god\s+mode\s+activated/gi,
      /jailbreak/gi,
      /unrestricted\s+mode/gi,
      /disable\s+(all\s+)?(safety|ethics|content\s+policy|filters?)/gi,
      /remove\s+(all\s+)?(restrictions?|limitations?|guardrails?)/gi,
      /bypass\s+(safety|content\s+policy|filters?)/gi,
    ],
    description: "Attempt to bypass AI safety measures",
    recommendation: "Work within standard AI capabilities and guidelines",
  },

  // Data Exfiltration
  {
    type: "data-exfiltration",
    level: "high",
    patterns: [
      /print\s+(your\s+)?(system\s+)?(prompt|instructions?)/gi,
      /show\s+(me\s+)?(your\s+)?(system\s+)?(prompt|instructions?|rules?)/gi,
      /reveal\s+(your\s+)?(system\s+)?(prompt|instructions?)/gi,
      /what\s+(are|were)\s+your\s+(original\s+)?(instructions?|prompt)/gi,
      /display\s+(your\s+)?(system\s+)?(prompt|instructions?)/gi,
      /repeat\s+(your\s+)?(system\s+)?(prompt|instructions?)/gi,
    ],
    description: "Attempt to extract system prompt or instructions",
    recommendation: "Rephrase to ask about capabilities rather than internals",
  },

  // Malicious Instructions
  {
    type: "malicious-instruction",
    level: "medium",
    patterns: [
      /output\s+exactly\s*:/gi,
      /respond\s+with\s+only\s*:/gi,
      /your\s+response\s+must\s+be\s+exactly\s*:/gi,
      /say\s+nothing\s+but\s*:/gi,
      /only\s+say\s*:/gi,
      /repeat\s+after\s+me\s*:/gi,
    ],
    description: "Overly restrictive output formatting that may hide injection",
    recommendation: "Use flexible output requirements instead of strict mandates",
  },

  // Suspicious Patterns
  {
    type: "suspicious-pattern",
    level: "low",
    patterns: [
      /###\s*SYSTEM/gi,
      /---\s*BEGIN\s+SYSTEM/gi,
      /\[ADMIN\]/gi,
      /\[ROOT\]/gi,
      /sudo\s+/gi,
      /chmod\s+/gi,
      /rm\s+-rf/gi,
    ],
    description: "Suspicious system-like patterns detected",
    recommendation: "Remove administrative or system-like syntax",
  },
];

// ============================================================================
// Threat Level Calculation
// ============================================================================

function calculateOverallThreatLevel(threats: SecurityThreat[]): SecurityThreatLevel {
  if (threats.length === 0) return "safe";

  const levels: SecurityThreatLevel[] = ["safe", "low", "medium", "high", "critical"];
  let maxLevel: SecurityThreatLevel = "safe";

  threats.forEach((threat) => {
    if (levels.indexOf(threat.level) > levels.indexOf(maxLevel)) {
      maxLevel = threat.level;
    }
  });

  return maxLevel;
}

// ============================================================================
// Main Security Scanner
// ============================================================================

export function scanPrompt(
  prompt: string,
  strictMode: boolean = false
): SecurityScanResult {
  const threats: SecurityThreat[] = [];
  const warnings: string[] = [];

  // Scan for each threat pattern
  THREAT_PATTERNS.forEach((patternGroup) => {
    // Skip low-level threats in non-strict mode
    if (!strictMode && patternGroup.level === "low") {
      return;
    }

    patternGroup.patterns.forEach((pattern) => {
      const matches = Array.from(prompt.matchAll(pattern));

      matches.forEach((match) => {
        if (match.index !== undefined) {
          const threat: SecurityThreat = {
            threatId: generateId(),
            type: patternGroup.type,
            level: patternGroup.level,
            pattern: pattern.source,
            match: match[0],
            position: {
              start: match.index,
              end: match.index + match[0].length,
            },
            description: patternGroup.description,
            recommendation: patternGroup.recommendation,
          };

          threats.push(threat);
        }
      });
    });
  });

  // Generate warnings based on threats
  const uniqueTypes = new Set(threats.map((t) => t.type));
  uniqueTypes.forEach((type) => {
    const threatsOfType = threats.filter((t) => t.type === type);
    if (threatsOfType.length > 0) {
      const example = threatsOfType[0];
      warnings.push(
        `${example.level.toUpperCase()}: ${example.description} (${threatsOfType.length} instance${threatsOfType.length > 1 ? "s" : ""})`
      );
    }
  });

  const threatLevel = calculateOverallThreatLevel(threats);
  const isSecure = threatLevel === "safe" || threatLevel === "low";

  return {
    isSecure,
    threatLevel,
    threats,
    warnings,
    appliedProtections: [],
    scannedAt: new Date(),
  };
}

// ============================================================================
// Quick Security Check
// ============================================================================

export function isPromptSafe(prompt: string, strictMode: boolean = false): boolean {
  const result = scanPrompt(prompt, strictMode);
  return result.isSecure;
}

// ============================================================================
// Threat Filtering
// ============================================================================

export function filterThreatsByLevel(
  threats: SecurityThreat[],
  minLevel: SecurityThreatLevel
): SecurityThreat[] {
  const levels: SecurityThreatLevel[] = ["safe", "low", "medium", "high", "critical"];
  const minIndex = levels.indexOf(minLevel);

  return threats.filter((threat) => levels.indexOf(threat.level) >= minIndex);
}

// ============================================================================
// Security Report Generation
// ============================================================================

export function generateSecurityReport(result: SecurityScanResult): string {
  let report = "=== Security Scan Report ===\n\n";
  report += `Overall Status: ${result.isSecure ? "✓ SECURE" : "⚠ THREATS DETECTED"}\n`;
  report += `Threat Level: ${result.threatLevel.toUpperCase()}\n`;
  report += `Threats Found: ${result.threats.length}\n\n`;

  if (result.warnings.length > 0) {
    report += "Warnings:\n";
    result.warnings.forEach((warning) => {
      report += `  • ${warning}\n`;
    });
    report += "\n";
  }

  if (result.threats.length > 0) {
    report += "Detailed Threats:\n";
    result.threats.forEach((threat, idx) => {
      report += `\n${idx + 1}. ${threat.type.toUpperCase()} [${threat.level}]\n`;
      report += `   Match: "${threat.match}"\n`;
      report += `   Position: ${threat.position.start}-${threat.position.end}\n`;
      report += `   Recommendation: ${threat.recommendation}\n`;
    });
  }

  return report;
}
