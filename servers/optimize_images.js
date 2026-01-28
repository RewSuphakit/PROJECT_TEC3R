const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const images = [
    { name: 'bbb.png', resize: true },
    { name: 'bg2.png', resize: true }
];

const assetsDir = path.resolve(__dirname, '../client/src/assets');

async function processImages() {
    for (const img of images) {
        const inputPath = path.join(assetsDir, img.name);
        const outputPath = path.join(assetsDir, img.name.replace('.png', '.webp'));

        try {
            console.log(`Processing ${img.name}...`);
            let pipeline = sharp(inputPath);

            const metadata = await pipeline.metadata();
            console.log(`Original size: ${metadata.width}x${metadata.height}`);

            if (img.resize && metadata.width > 1920) {
                pipeline = pipeline.resize(1920);
            }

            await pipeline
                .webp({ quality: 80 })
                .toFile(outputPath);

            console.log(`Saved to ${path.basename(outputPath)}`);

            const stats = fs.statSync(outputPath);
            console.log(`New size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        } catch (error) {
            console.error(`Error processing ${img.name}:`, error);
        }
    }
}

processImages();
