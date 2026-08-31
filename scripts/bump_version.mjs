import fs from 'node:fs/promises';
import path from 'node:path';

export function getNextVersion(currentVersion) {
  const parts = currentVersion.split('.').map(Number);
  
  if (parts.length === 3) {
    if (parts[2] < 10) {
      // e.g. 1.1.2 -> 1.1.3 ... up to 1.1.10
      parts[2] += 1;
      return parts.join('.');
    } else {
      // Max 10 reached for x.x.x, transition to x.x.x.x (e.g. 1.1.10 -> 1.1.10.1)
      return `${parts[0]}.${parts[1]}.${parts[2]}.1`;
    }
  } else if (parts.length === 4) {
    if (parts[3] < 10) {
      // e.g. 1.1.10.1 -> 1.1.10.2 ... up to 1.1.10.10
      parts[3] += 1;
      return parts.join('.');
    } else {
      // Max 10 reached for 4th component, rollover to next minor version
      return `${parts[0]}.${parts[1] + 1}.0`;
    }
  } else {
    parts[parts.length - 1] += 1;
    return parts.join('.');
  }
}

async function bump() {
  const pkgPath = path.resolve('package.json');
  const pkgRaw = await fs.readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgRaw);

  const newVersion = getNextVersion(pkg.version);
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
