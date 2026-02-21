/**
 * 画像の白い部分を透過するスクリプト
 * 使い方: node scripts/make-transparent.js
 */
const fs = require('fs');
const path = require('path');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('sharp がインストールされていません。npm install sharp を実行してください。');
    process.exit(1);
  }

  const inputPath = path.join(__dirname, '../public/images/shoshinsha-mark.png');
  const outputPath = path.join(__dirname, '../public/images/shoshinsha-mark-transparent.png');

  const image = sharp(inputPath);
  const { data, info } = await image
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  const whiteThreshold = 240; // 白に近い部分を透過
  const blackThreshold = 25;   // 黒に近い部分を透過
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const isWhite = r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold;
    const isBlack = r <= blackThreshold && g <= blackThreshold && b <= blackThreshold;
    if (isWhite || isBlack) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toFile(outputPath);

  console.log('Saved:', outputPath);
}

main().catch(console.error);
