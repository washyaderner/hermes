# Lessons - Hermes

### 2026-04-07 | architecture

**Correction:** The original enhancer was pure string concatenation - appending literal instructions like "\n\nTone: Maintain a professional tone" to prompts. This isn't prompt engineering, it's templating.
**Rule:** When building a prompt engineering tool, the enhancement engine must apply real PE techniques (role framing, structured sections, platform-specific formatting, few-shot injection) - not just append instructions as text.

### 2026-04-07 | scope

**Correction:** Multiple systems were half-built and abandoned: wizard flows collected data then threw it away (console.log), history/templates pages had dead auth checks, CSS had three conflicting theme systems.
**Rule:** On existing codebases, scan for dead-end flows and conflicting systems before adding new features. Half-built features that look complete are worse than missing features.

### 2026-04-07 | architecture

**Correction:** tailwind.config.ts hardcoded color values while globals.css defined CSS variables. Components used a mix of both plus raw utility classes. Three theme systems fighting.
**Rule:** Single source of truth for design tokens. CSS variables in globals.css, tailwind config references var(--*), components use theme tokens only. Never hardcode colors in tailwind.config.ts when CSS variables exist.
