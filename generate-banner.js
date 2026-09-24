import sharp from 'sharp';

const width = 1024;
const height = 500;
const svgText = `
<svg width="${width}" height="${height}">
  <rect width="100%" height="100%" fill="#FFD700" />
  <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="#111111" text-anchor="middle" dominant-baseline="middle">
    Houssem Academy
  </text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="36" fill="#333333" text-anchor="middle" dominant-baseline="middle">
    L'excellence éducative au quotidien
  </text>
</svg>
`;

sharp(Buffer.from(svgText))
  .png()
  .toFile('image_presentation_1024x500.png')
  .then(() => console.log('Image créée avec succès : image_presentation_1024x500.png'))
  .catch(err => console.error('Erreur :', err));
