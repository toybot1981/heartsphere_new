/**
 * 技能创建器 - 文件上传测试
 * 使用 frontend-design SKILL.md 测试上传流程
 * 运行: cd main/frontend && node scripts/test-skill-file-upload.mjs
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const SKILL_FILE = path.join(PROJECT_ROOT, '.claude/skills/frontend-design/SKILL.md');

const ADMIN_URL = 'http://localhost:3005/admin';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Tyx@19811009';

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('1. 打开管理端登录页...');
    await page.goto(ADMIN_URL, { waitUntil: 'networkidle' });

    console.log('2. 登录...');
    await page.getByPlaceholder('请输入用户名').fill(ADMIN_USER);
    await page.getByPlaceholder('请输入密码').fill(ADMIN_PASS);
    await page.getByRole('button', { name: /进入系统|登录/ }).click();
    await page.waitForURL(/\/admin/, { timeout: 10000 });

    console.log('3. 进入技能管理 -> 专业创建器...');
    await page.getByRole('button', { name: /内容管理/ }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /技能管理/ }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /专业创建器/ }).click();
    await page.waitForSelector('text=选择创建方式', { timeout: 15000 });

    console.log('4. 选择文件导入 -> 上传文件...');
    await page.getByText('上传已有的 skill.md 文件或直接粘贴 Markdown 内容').click();
    await page.waitForTimeout(500);
    const uploadTab = page.getByRole('button', { name: '上传文件' });
    if (await uploadTab.isVisible()) {
      await uploadTab.click();
      await page.waitForTimeout(200);
    }

    console.log('5. 上传 SKILL 文件...');
    const fileInput = page.locator('input[type="file"][accept=".md"]');
    await fileInput.setInputFiles(SKILL_FILE);
    await page.waitForTimeout(500);

    const dropZone = page.getByText('已选择:');
    await dropZone.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
    if (await dropZone.isVisible()) {
      console.log('   已选择文件:', await dropZone.textContent());
    }

    console.log('6. 点击导入...');
    await page.getByRole('button', { name: '导入' }).click();
    await page.waitForSelector('text=导入中...', { state: 'visible', timeout: 3000 }).catch(() => null);
    await page.waitForSelector('text=导入中...', { state: 'hidden', timeout: 25000 });
    await page.waitForTimeout(1500);

    const btnContinue = page.getByRole('button', { name: '继续编辑' });
    const success = page.getByText(/导入成功|解析的内容预览/);
    const errParse = page.getByText('文件解析失败');
    const errEl = page.locator('[style*="f8d7da"], [style*="721c24"]');
    const found = await Promise.race([
      btnContinue.waitFor({ state: 'visible', timeout: 18000 }).then(() => 'ok'),
      success.waitFor({ state: 'visible', timeout: 18000 }).then(() => 'ok'),
      errParse.waitFor({ state: 'visible', timeout: 18000 }).then(() => 'parse_err'),
      errEl.waitFor({ state: 'visible', timeout: 18000 }).then(() => 'err'),
    ]).catch(() => 'timeout');

    if (found === 'parse_err') {
      const errText = await errParse.textContent();
      console.error('7. 导入报错:', errText);
      await page.screenshot({ path: path.join(PROJECT_ROOT, 'skill-import-error.png') });
      throw new Error('文件解析失败: ' + (errText || '后端解析异常'));
    }
    if (found === 'err') {
      const errText = await errEl.textContent();
      console.error('7. 导入报错:', errText);
      await page.screenshot({ path: path.join(PROJECT_ROOT, 'skill-import-error.png') });
      throw new Error('导入失败: ' + (errText || '未知'));
    }
    if (found === 'timeout') {
      await page.screenshot({ path: path.join(PROJECT_ROOT, 'skill-import-timeout.png') });
      const body = await page.locator('body').innerText();
      const fp = path.join(PROJECT_ROOT, 'skill-import-timeout.txt');
      await writeFile(fp, body, 'utf8');
      console.error('  超时时的页面文本已写入:', fp);
      throw new Error('等待导入结果超时');
    }
    console.log('7. 导入成功，已展示解析预览。');

    const continueBtn = page.getByRole('button', { name: '继续编辑' });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForSelector('text=基础信息', { timeout: 5000 });
      console.log('8. 已进入基础信息（手动编辑），流程通过。');
    }

    console.log('\n✅ 文件上传测试通过');
  } catch (e) {
    console.error('\n❌ 测试失败:', e.message);
    throw e;
  } finally {
    if (browser) await browser.close();
  }
}

main();
