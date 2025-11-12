/**
 * Design Tokens
 * Centralized design system values for Hermes
 */

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

  // Common transitions
  hover: {
    scale: 1.02,
    duration: 0.3,
    ease: 'easeOut',
  },

  cardHover: {
    scale: 1.02,
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
 * Layered shadows for depth and focus states
 */
export const shadows = {
  glow: {
    subtle: '0 0 20px rgba(100, 116, 139, 0.15)',
    medium: '0 0 20px rgba(100, 116, 139, 0.25)',
    strong: '0 0 30px rgba(100, 116, 139, 0.3)',
  },

  elevation: {
    low: '0 10px 20px rgba(0, 0, 0, 0.3)',
    medium: '0 20px 40px rgba(0, 0, 0, 0.5)',
    high: '0 25px 50px rgba(0, 0, 0, 0.6)',
  },

  // Combined shadows for hover states
  cardHover: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(100, 116, 139, 0.25)',
  cardHoverStrong: '0 25px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(100, 116, 139, 0.3)',
  inputHover: '0 0 0 0 transparent, 0 4px 8px rgba(100, 116, 139, 0.2)',
} as const;

/**
 * Focus States
 *
 * Values for progressive disclosure and focus management
 */
export const focusStates = {
  // Scale values for focused/unfocused cards
  scale: {
    focused: 1.03,
    unfocused: 0.98,
    neutral: 1,
  },

  // Opacity values for emphasis
  opacity: {
    focused: 1,
    unfocused: 0.6,
    neutral: 1,
  },

  // Border colors for states
  border: {
    focused: 'rgba(100, 116, 139, 0.7)',
    hover: 'rgba(100, 116, 139, 0.5)',
    neutral: 'rgba(100, 116, 139, 0.3)',
  },
} as const;
