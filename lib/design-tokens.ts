/**
 * Design Tokens
 * Centralized design system values for Hermes
 *
 * Minimalist Dark Theme Philosophy:
 * - Pure black backgrounds for depth
 * - Dark slate cards with subtle transparency
 * - White to light gray text hierarchy
 * - Subtle borders, no harsh contrasts
 * - Green for success states only
 */

/**
 * Color Palette
 *
 * Global minimalist slate color scheme
 */
export const colors = {
  // Backgrounds
  background: {
    primary: '#000000',        // Pure black
    secondary: '#0f172a',      // Slate-900 - cards
    tertiary: '#1e293b',       // Slate-800 - elevated elements
  },

  // Text
  text: {
    primary: '#ffffff',        // Pure white - headers
    secondary: '#e2e8f0',      // Slate-200 - body text
    tertiary: '#94a3b8',       // Slate-400 - muted text
    quaternary: '#64748b',     // Slate-500 - subtle text
    disabled: '#475569',       // Slate-600 - disabled
  },

  // Borders
  border: {
    subtle: '#1e293b',         // Slate-800 - minimal borders
    default: '#334155',        // Slate-700 - standard borders
    emphasis: '#475569',       // Slate-600 - hover borders
    focus: '#94a3b8',          // Slate-400 - focused state
  },

  // Interactive
  interactive: {
    default: '#334155',        // Slate-700 - buttons
    hover: '#475569',          // Slate-600 - button hover
    active: '#1e293b',         // Slate-800 - button active
  },

  // Semantic
  semantic: {
    success: '#22c55e',        // Green-500 - success/complete
    successMuted: '#16a34a',   // Green-600 - success secondary
    warning: '#f59e0b',        // Amber-500 - warnings
    error: '#ef4444',          // Red-500 - errors
  },
} as const;

/**
 * Border Radius System
 *
 * Philosophy: Progressive sharpening as users go deeper into the experience
 * - welcome (2xl): Warm, friendly invitation for initial mode selection
 * - guided (lg): Clean, approachable for step-by-step flows
 * - power (sm): Precise, technical for advanced controls
 * - action (md): Balanced softness for interactive elements
 */
export const borderRadius = {
  // Journey stages
  welcome: 'rounded-2xl',    // 16px - ModeSelection: warm invitation
  guided: 'rounded-lg',      // 8px  - QuickMode: friendly guidance
  power: 'rounded-sm',       // 2px  - GodMode: precision control

  // Component-specific overrides
  action: 'rounded-md',      // 6px  - Buttons & CTAs: inviting interaction
  input: 'rounded-sm',       // 2px  - Form inputs: consistent precision
  card: {
    welcome: 'rounded-2xl',  // Hero cards in mode selection
    default: 'rounded-lg',   // Standard content cards
    compact: 'rounded-md',   // Smaller nested cards
    power: 'rounded-sm',     // God Mode configuration cards
  },
} as const;

/**
 * Animation Presets
 *
 * Consistent timing and easing for Framer Motion animations
 * Typeform-inspired: Subtle, no aggressive scaling
 */
export const animation = {
  // Durations (in seconds)
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
  },

  // Easings
  easing: {
    smooth: 'easeOut',
    snappy: 'easeInOut',
    bounce: [0.68, -0.55, 0.265, 1.55],
  },

  // Common transitions - no scaling to prevent cutoff
  hover: {
    duration: 0.3,
    ease: 'easeOut',
  },

  cardHover: {
    duration: 0.3,
    ease: 'easeOut',
  },

  // Stagger for sequential reveals
  stagger: {
    children: 0.1,  // Delay between child animations
  },
} as const;

/**
 * Shadow Presets
 *
 * Typeform-inspired: Subtle glows instead of heavy shadows
 */
export const shadows = {
  glow: {
    subtle: '0 0 0 1px rgba(100, 116, 139, 0.2)',
    medium: '0 0 0 1px rgba(100, 116, 139, 0.3)',
    strong: '0 0 0 2px rgba(100, 116, 139, 0.4)',
  },

  elevation: {
    low: '0 2px 8px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
    high: '0 8px 24px rgba(0, 0, 0, 0.2)',
  },

  // Typeform-style: Border glow instead of shadow
  cardHover: '0 0 0 1px rgba(148, 163, 184, 0.4)',
  cardHoverStrong: '0 0 0 2px rgba(148, 163, 184, 0.5)',
  inputHover: '0 0 0 1px rgba(148, 163, 184, 0.3)',
} as const;

/**
 * Focus States
 *
 * Typeform-inspired: Subtle emphasis without scaling
 */
export const focusStates = {
  // No scaling - prevents cutoff issues
  scale: {
    focused: 1,
    unfocused: 1,
    neutral: 1,
  },

  // Opacity values for emphasis
  opacity: {
    focused: 1,
    unfocused: 0.7,
    neutral: 1,
  },

  // Border colors for Typeform-style highlight
  border: {
    focused: 'rgba(148, 163, 184, 0.6)',
    hover: 'rgba(148, 163, 184, 0.4)',
    neutral: 'rgba(100, 116, 139, 0.3)',
  },
} as const;
