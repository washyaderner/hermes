# Wins - Hermes

### 2026-04-07 | approach

**Signal:** "Oh yeah" - immediate positive reaction to the rebuild, then asked for a summary doc (/md). No corrections on any of the 6 changes. Trusted the full rebuild without pushback.
**What worked:** Scanning the entire codebase deeply before touching anything, identifying the 6 real problems (not surface symptoms), then executing all fixes in one pass with build verification.
**Pattern:** Deep scan -> prioritized problem list -> sequential execution -> verify. Don't propose - just build.

### 2026-04-07 | speed

**Signal:** Zero corrections across a full engine rewrite, wizard wiring, auth fix, theme unification, dashboard restructure, and build verification. Session recovered cleanly after disconnect.
**What worked:** Having every critical file in context before starting meant the disconnect didn't cost anything. Picked up exactly where I stopped.
**Pattern:** Front-load all file reads before making changes. Context resilience comes from reading first, not from memory.

### 2026-04-07 | architecture

**Signal:** Enhancement engine now produces platform-appropriate output (XML tags for Claude, markdown headers for ChatGPT, /imagine for Midjourney) and all three variation strategies are distinct.
**What worked:** Intent x domain matrix for role inference, 8-stage pipeline with platform-specific formatters, real few-shot examples per intent type.
**Pattern:** Prompt engineering tools should eat their own cooking. The enhancer should apply the same techniques it teaches.
