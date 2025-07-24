const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. GitHub 로그인 중...');
    await page.goto('https://github.com/login');
    await page.fill('input[name="login"]', 'psykim');
    await page.fill('input[name="password"]', 'Mhrk0315@');
    await page.click('input[type="submit"]');
    
    await page.waitForTimeout(3000);

    console.log('2. VERBAL_LEARNING 저장소 설정 페이지로 이동...');
    await page.goto('https://github.com/psykim/VERBAL_LEARNING/settings');
    await page.waitForTimeout(2000);

    // Pages 섹션으로 스크롤
    console.log('3. Pages 설정 확인...');
    await page.goto('https://github.com/psykim/VERBAL_LEARNING/settings/pages');
    await page.waitForTimeout(3000);

    // 스크린샷 저장
    await page.screenshot({ path: 'github-pages-settings.png', fullPage: true });

    // GitHub Pages가 활성화되어 있는지 확인
    const pagesEnabled = await page.locator('text=Your site is live at').isVisible().catch(() => false);
    
    if (pagesEnabled) {
      console.log('✓ GitHub Pages가 활성화되어 있습니다.');
      const url = await page.locator('a[href*="github.io"]').first().getAttribute('href');
      console.log(`  사이트 URL: ${url}`);
    } else {
      console.log('✗ GitHub Pages가 비활성화되어 있습니다.');
      
      // Source 선택
      const sourceButton = await page.locator('button:has-text("Deploy from a branch")').isVisible();
      if (!sourceButton) {
        await page.locator('text=Source').click();
        await page.locator('text=Deploy from a branch').click();
      }

      // Branch 선택
      await page.locator('button[id*="branch"]').click();
      await page.locator('text=main').click();
      
      // Root 폴더 선택
      await page.locator('button[id*="folder"]').click();
      await page.locator('text=/ (root)').click();
      
      // Save 버튼 클릭
      await page.locator('button:has-text("Save")').click();
      
      console.log('✓ GitHub Pages를 활성화했습니다.');
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'github-pages-enabled.png', fullPage: true });
    }

    // 파일 목록 확인
    console.log('\n4. 저장소 파일 확인...');
    await page.goto('https://github.com/psykim/VERBAL_LEARNING');
    await page.waitForTimeout(2000);
    
    const files = await page.locator('.js-navigation-item .content a').allTextContents();
    console.log('파일 목록:', files);

  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();