import fs from 'node:fs/promises';
import path from 'node:path';

async function bump() {
  const pkgPath = path.resolve('package.json');
  const pkgRaw = await fs.readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgRaw);

  const parts = pkg.version.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1;
  const newVersion = parts.join('.');
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

bump().catch(err => {
  console.error(err);
  process.exit(1);
});
