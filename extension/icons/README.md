# Extension Icons

This directory should contain the following icon sizes for the browser extension:

- `icon-16.png` - 16x16px (toolbar icon, small)
- `icon-48.png` - 48x48px (extension management page)
- `icon-128.png` - 128x128px (Chrome Web Store, installation)

## Creating Icons

You can create these icons using any image editor. The recommended design is:
- Purple gradient background (#6b46c1 to #7c4fd9)
- Lightning bolt (⚡) or "H" symbol in white
- Rounded corners for modern look

## Temporary Placeholders

For development, you can create simple placeholder images:

```bash
# Using ImageMagick (if installed)
convert -size 16x16 xc:#6b46c1 icon-16.png
convert -size 48x48 xc:#6b46c1 icon-48.png
convert -size 128x128 xc:#6b46c1 icon-128.png
```

## Production Icons

For production, use a proper icon design tool or service like:
- Figma
- Adobe Illustrator
- Canva
- Icon generators online

The icons should match the Hermes brand:
- Primary color: #6b46c1 (purple)
- Accent color: #f97316 (orange)
- Background: Gradient or solid
- Symbol: Lightning bolt ⚡ representing speed and power
