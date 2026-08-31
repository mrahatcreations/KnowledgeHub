import fs from 'node:fs/promises';
import path from 'node:path';

export function getNextVersion(currentVersion, bumpType = 'patch') {
  const parts = currentVersion.split('.').map(Number);
  while (parts.length < 3) parts.push(0);
  
  if (bumpType === 'major') {
    parts[0] += 1;
    parts[1] = 0;
    parts[2] = 0;
  } else if (bumpType === 'minor') {
    parts[1] += 1;
    parts[2] = 0;
  } else {
    // Standard patch increment (e.g. 1.1.9 -> 1.1.10 -> 1.1.11 ...)
    parts[2] = (parts[2] || 0) + 1;
  }
  
  return parts.slice(0, 3).join('.');
}

async function bump() {
  const pkgPath = path.resolve('package.json');
  const pkgRaw = await fs.readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgRaw);

  const bumpType = process.argv[2] || 'patch';
  const newVersion = getNextVersion(pkg.version, bumpType);
  pkg.version = newVersion;

  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

  // Update android/app/build.gradle
  const gradlePath = path.resolve('android/app/build.gradle');
  let gradleContent = await fs.readFile(gradlePath, 'utf8');

  let nextCode = 1;
  gradleContent = gradleContent.replace(/versionCode\s+(\d+)/, (match, p1) => {
    nextCode = parseInt(p1, 10) + 1;
    return `versionCode ${nextCode}`;
  });

  gradleContent = gradleContent.replace(/versionName\s+"[^"]+"/, () => {
    return `versionName "${newVersion}"`;
  });

  await fs.writeFile(gradlePath, gradleContent, 'utf8');

  console.log(`🚀 [Bump Version] New Version: v${newVersion} (versionCode: ${nextCode})`);
  return newVersion;
}

import { fileURLToPath } from 'node:url';

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  bump().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
