import { _electron as electron } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
const userData = await mkdtemp(`${tmpdir()}/o2-smoke-`);
const executablePath = process.env.O2_EXECUTABLE;
const instance = await electron.launch({ ...(executablePath ? { executablePath, args: [`--user-data-dir=${userData}`] } : { args: [resolve('.'), `--user-data-dir=${userData}`] }) });
try {
  const page = await instance.firstWindow();
  await page.waitForFunction(() => Boolean(window.launcher));
  const query = page.locator('#query');
  await query.fill('2 + 3 * 4');
  await page.locator('.row .title').filter({ hasText: '14' }).waitFor();
  await instance.evaluate(async ({ clipboard, ClipboardItem }) => {
    globalThis.o2SavedClipboard = await Promise.all((await clipboard.read()).map(async item => new ClipboardItem(Object.fromEntries(await Promise.all(item.types.map(async type => [type, await item.getType(type)]))))));
  });
  try {
    await query.press('Enter');
    await page.waitForFunction(() => document.querySelector('#status').textContent === 'Copied to clipboard');
    assert.equal(await instance.evaluate(({ clipboard }) => clipboard.readText()), '14');
  } finally { await instance.evaluate(async ({ clipboard }) => { await clipboard.write(globalThis.o2SavedClipboard); delete globalThis.o2SavedClipboard; }); }
  await query.fill('1/0');
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('division by zero'));
  await query.fill('Safari');
  await page.locator('.row').first().waitFor();
  assert.ok((await page.locator('.row .title').allTextContents()).some(name => name.includes('Safari')));
  await query.fill('calc 20 * 3');
  await page.locator('.row .title').filter({ hasText: 'Calculate and copy' }).waitFor();
  await query.fill('2 + 3 * 4');
  await page.locator('.row .title').filter({ hasText: '14' }).waitFor();
  await page.locator('#config-button').click();
  await page.locator('#peek.open #peek-json').waitFor();
  await page.locator('#close-peek').click();
  await query.press('Meta+l');
  await page.locator('#large.open #large-text').filter({ hasText: '14' }).waitFor();
  await page.locator('#large').click();
  await mkdir('artifacts', { recursive: true });
  await page.locator('#app').screenshot({ path: 'artifacts/o2-app.png' });
  await query.press('Escape');
  assert.equal(await instance.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isVisible()), false);
  await instance.evaluate(({ app }) => app.emit('activate'));
  assert.equal(await instance.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].isVisible()), true);
  console.log('PASS: macOS startup, preload, config, calculator copy, errors, catalog, workflows, hide/reopen');
} finally { await instance.close(); await rm(userData, { recursive: true, force: true }); }
