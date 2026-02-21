export const COLORS = {
  primary: '#4a90d9',
  primaryDark: '#357abd',
  background: '#f0f4ff',
  backgroundSecondary: '#f8f9ff',
  white: '#ffffff',
  card: '#ffffff',
  text: '#1a1a2e',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  inputBg: '#f9fafb',
  error: '#dc2626',
  errorBg: '#fef2f2',
  tabBg: '#f1f3f8',
  shadow: '#000000',
  google: {
    blue: '#4285F4',
    green: '#34A853',
    yellow: '#FBBC05',
    red: '#EA4335',
  },
  modules: {
    shopping: { bg: '#fff1f2', text: '#e11d48', iconBg: '#ffe4e6', border: '#fecdd3' },
    budget: { bg: '#ecfdf5', text: '#059669', iconBg: '#d1fae5', border: '#a7f3d0' },
    recipes: { bg: '#fffbeb', text: '#d97706', iconBg: '#fef3c7', border: '#fde68a' },
    weekly: { bg: '#f0f9ff', text: '#0284c7', iconBg: '#e0f2fe', border: '#bae6fd' },
    monthly: { bg: '#f5f3ff', text: '#7c3aed', iconBg: '#ede9fe', border: '#ddd6fe' },
    yearly: { bg: '#fff7ed', text: '#ea580c', iconBg: '#ffedd5', border: '#fed7aa' },
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
};

export const FONT = {
  regular: { fontWeight: '400' as const },
  medium: { fontWeight: '500' as const },
  semibold: { fontWeight: '600' as const },
  bold: { fontWeight: '700' as const },
};

export const COUNTRY_CODES = [
  { code: '+91', country: 'IN', flag: '\u{1F1EE}\u{1F1F3}' },
  { code: '+1', country: 'US', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: '+44', country: 'UK', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: '+61', country: 'AU', flag: '\u{1F1E6}\u{1F1FA}' },
  { code: '+971', country: 'AE', flag: '\u{1F1E6}\u{1F1EA}' },
];
