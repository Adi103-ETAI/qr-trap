import sharp from 'sharp';

(async () => {
  await sharp('public/cyberclub.png')
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile('public/cyberclub-optimized.png');
  console.log('Optimized logo saved');
})();
