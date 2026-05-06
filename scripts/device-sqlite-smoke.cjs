#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const deviceApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:37200/api/v1';
const hostApiBaseUrl = process.env.API_BASE_URL || toHostApiBaseUrl(deviceApiBaseUrl);
const docPath = path.join(root, 'docs/testing/2026-05-05-device-sqlite-smoke.md');
const appJsonPath = path.join(root, 'apps/mobile/app.json');
const runtimePath = path.join(root, 'apps/mobile/src/db/sync/runtime.ts');
const databasePath = path.join(root, 'apps/mobile/src/db/database.ts');
const nodeMajor = Number(process.versions.node.split('.')[0]);

const checks = [];

function pass(name, detail) {
  checks.push({ status: 'PASS', name, detail });
}

function fail(name, detail) {
  checks.push({ status: 'FAIL', name, detail });
}

function warn(name, detail) {
  checks.push({ status: 'WARN', name, detail });
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function requireFile(filePath, label) {
  if (fs.existsSync(filePath)) {
    pass(label, path.relative(root, filePath));
    return true;
  }

  fail(label, `missing ${path.relative(root, filePath)}`);
  return false;
}

async function checkApiHealth() {
  try {
    const response = await fetch(`${hostApiBaseUrl}/health`, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      fail('api health', `${hostApiBaseUrl}/health returned ${response.status}`);
      return;
    }

    pass('api health', `${hostApiBaseUrl}/health`);
  } catch (error) {
    fail('api health', `${hostApiBaseUrl}/health unreachable: ${error.message}`);
  }
}

function toHostApiBaseUrl(baseUrl) {
  return baseUrl.replace('://10.0.2.2:', '://127.0.0.1:');
}

async function main() {
  if (nodeMajor >= 20) {
    pass('node version', process.versions.node);
  } else {
    fail('node version', `Node ${process.versions.node}; require >=20`);
  }

  const hasDoc = requireFile(docPath, 'device smoke doc');
  const hasAppJson = requireFile(appJsonPath, 'expo app config');
  const hasRuntime = requireFile(runtimePath, 'sqlite sync runtime');
  const hasDatabase = requireFile(databasePath, 'sqlite database module');

  if (hasAppJson) {
    const appConfig = JSON.parse(readText(appJsonPath));
    const plugins = appConfig.expo?.plugins ?? [];
    if (plugins.includes('expo-sqlite')) {
      pass('expo-sqlite plugin', 'apps/mobile/app.json');
    } else {
      fail('expo-sqlite plugin', 'apps/mobile/app.json missing expo-sqlite');
    }
  }

  if (hasRuntime) {
    const runtime = readText(runtimePath);
    for (const exportName of ['runSyncRuntimeSmoke', 'createOfflineTodoForSync', 'createOfflineEnergyForSync', 'syncOfflineChanges']) {
      if (runtime.includes(`function ${exportName}`)) {
        pass(`runtime export ${exportName}`, 'present');
      } else {
        fail(`runtime export ${exportName}`, 'missing');
      }
    }
  }

  if (hasDatabase) {
    const database = readText(databasePath);
    if (database.includes("openDatabaseAsync('newme.db')") || database.includes('openDatabaseAsync("newme.db")')) {
      pass('sqlite database name', 'newme.db');
    } else {
      fail('sqlite database name', 'newme.db not found');
    }

    if (database.includes('runMigrations')) {
      pass('sqlite migrations', 'runMigrations invoked');
    } else {
      fail('sqlite migrations', 'runMigrations not invoked');
    }
  }

  if (/127\.0\.0\.1|localhost/.test(deviceApiBaseUrl)) {
    warn('device api base url', `${deviceApiBaseUrl} works for web/simulator; physical devices need a LAN IP`);
  } else {
    pass('device api base url', deviceApiBaseUrl);
  }

  if (hostApiBaseUrl !== deviceApiBaseUrl) {
    pass('host api health base url', hostApiBaseUrl);
  }

  await checkApiHealth();

  for (const check of checks) {
    const detail = check.detail ? ` - ${check.detail}` : '';
    console.log(`${check.status} ${check.name}${detail}`);
  }

  console.log('');
  console.log('Manual device smoke checklist:');
  console.log('1. Clear app data or reinstall, then start Expo with --host lan.');
  console.log('2. Log in through /auth/login using the current /auth/code devCode.');
  console.log('3. Visit todo, energy, plan, and tree once; watch for SQLite open/migration errors.');
  console.log('4. Disable network, add a todo, and confirm today energy; local optimistic state must remain.');
  console.log('5. Restore network, run runtime sync, and verify /sync/push plus /sync/pull succeed.');
  console.log('6. Save evidence under test-results/device-sqlite-smoke/.');

  if (checks.some((check) => check.status === 'FAIL')) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
