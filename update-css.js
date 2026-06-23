const fs = require('fs');
const path = require('path');

const jsonString = `{
  "slate-700": "#2C333D",
  "on-error": "#690005",
  "surface": "#101419",
  "secondary-fixed": "#6ffbbe",
  "surface-variant": "#31353c",
  "on-primary-fixed-variant": "#653e00",
  "on-tertiary": "#4d2600",
  "surface-container-highest": "#31353c",
  "error": "#ffb4ab",
  "on-tertiary-fixed": "#2f1500",
  "surface-container-high": "#262a31",
  "primary-fixed-dim": "#ffb95f",
  "tertiary": "#ffc08e",
  "on-secondary-fixed": "#002113",
  "inverse-on-surface": "#2d3137",
  "tertiary-fixed": "#ffdcc3",
  "surface-dim": "#101419",
  "on-tertiary-container": "#6a3700",
  "primary-fixed": "#ffddb8",
  "on-primary": "#472a00",
  "background": "#101419",
  "light-subtle": "#F8FAFC",
  "secondary-container": "#00a572",
  "on-surface": "#dfe2eb",
  "on-surface-variant": "#d8c3ad",
  "primary-container": "#f59e0b",
  "surface-container-lowest": "#0a0e14",
  "on-tertiary-fixed-variant": "#6e3900",
  "gold-accent": "#FBBF24",
  "inverse-primary": "#855300",
  "light-bg": "#FFFFFF",
  "tertiary-container": "#ff9837",
  "surface-container": "#1c2026",
  "primary": "#ffc174",
  "tertiary-fixed-dim": "#ffb77d",
  "surface-tint": "#ffb95f",
  "inverse-surface": "#dfe2eb",
  "light-border": "#E2E8F0",
  "on-secondary": "#003824",
  "on-secondary-container": "#00311f",
  "slate-950": "#0F1115",
  "slate-900": "#161A20",
  "outline-variant": "#534434",
  "error-container": "#93000a",
  "surface-bright": "#353940",
  "on-primary-container": "#613b00",
  "secondary": "#4edea3",
  "on-secondary-fixed-variant": "#005236",
  "outline": "#a08e7a",
  "on-primary-fixed": "#2a1700",
  "on-background": "#dfe2eb",
  "slate-800": "#1E232B",
  "emerald-accent": "#10B981",
  "surface-container-low": "#181c22",
  "secondary-fixed-dim": "#4edea3",
  "on-error-container": "#ffdad6"
}`;

const spacing = {
  "xxs": "4px",
  "gutter": "20px",
  "lg": "24px",
  "xl": "32px",
  "md": "16px",
  "sm": "12px",
  "xs": "8px",
  "margin-page": "40px",
  "base": "4px"
};

const colors = JSON.parse(jsonString);

let cssAppend = '\\n@theme inline {\\n';
for (const [key, value] of Object.entries(colors)) {
  cssAppend += \`  --color-\${key}: \${value};\\n\`;
}
for (const [key, value] of Object.entries(spacing)) {
  cssAppend += \`  --spacing-\${key}: \${value};\\n\`;
}

// Add fonts
cssAppend += \`  --font-label-caps: 'Inter';
  --font-code-md: 'JetBrains Mono';
  --font-code-sm: 'JetBrains Mono';
  --font-headline-xl: 'Geist';
  --font-body-sm: 'Inter';
  --font-headline-lg: 'Geist';
  --font-headline-lg-mobile: 'Geist';
  --font-title-md: 'Geist';
  --font-body-lg: 'Inter';
  --font-body-md: 'Inter';
\`;

// Add text sizes
cssAppend += \`  --text-label-caps: 12px;
  --text-label-caps--line-height: 16px;
  --text-label-caps--letter-spacing: 0.05em;
  --text-label-caps--font-weight: 600;

  --text-code-md: 14px;
  --text-code-md--line-height: 22px;
  --text-code-md--font-weight: 450;

  --text-code-sm: 12px;
  --text-code-sm--line-height: 18px;
  --text-code-sm--font-weight: 450;

  --text-headline-xl: 36px;
  --text-headline-xl--line-height: 44px;
  --text-headline-xl--letter-spacing: -0.02em;
  --text-headline-xl--font-weight: 600;

  --text-body-sm: 14px;
  --text-body-sm--line-height: 20px;
  --text-body-sm--font-weight: 400;

  --text-headline-lg: 28px;
  --text-headline-lg--line-height: 36px;
  --text-headline-lg--letter-spacing: -0.01em;
  --text-headline-lg--font-weight: 600;

  --text-title-md: 20px;
  --text-title-md--line-height: 28px;
  --text-title-md--font-weight: 500;

  --text-body-lg: 18px;
  --text-body-lg--line-height: 28px;
  --text-body-lg--font-weight: 400;

  --text-body-md: 16px;
  --text-body-md--line-height: 24px;
  --text-body-md--font-weight: 400;
\`;

cssAppend += '}\\n';

const globalsPath = path.join(__dirname, 'frontend', 'src', 'app', 'globals.css');
fs.appendFileSync(globalsPath, cssAppend);
console.log('Appended to globals.css');
