const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. GitHub 로그인...');
    await page.goto('https://github.com/login');
    await page.fill('input[name="login"]', 'psykim');
    await page.fill('input[name="password"]', 'Mhrk0315@');
    await page.click('input[type="submit"]');
    
    await page.waitForTimeout(3000);

    console.log('2. Pages 설정 페이지로 이동...');
    await page.goto('https://github.com/psykim/VERBAL_LEARNING/settings/pages');
    await page.waitForTimeout(3000);

    // Build and deployment 섹션 찾기
    console.log('3. GitHub Pages 설정 변경...');
    
    try {
      // Source 버튼 찾기 - 더 구체적인 선택자 사용
      const sourceButton = await page.locator('summary:has-text("Deploy from a branch")').first();
      if (await sourceButton.isVisible()) {
        console.log('   이미 "Deploy from a branch"가 선택되어 있습니다.');
      } else {
        // Source 드롭다운 클릭
        await page.locator('button[aria-label*="Source"]').click();
        await page.waitForTimeout(1000);
        await page.locator('button:has-text("Deploy from a branch")').click();
        await page.waitForTimeout(1000);
      }

      // Branch 선택
      const branchButton = await page.locator('button[id*="branch-select"]').or(page.locator('summary:has-text("None")')).first();
      await branchButton.click();
      await page.waitForTimeout(1000);
      
      // main 브랜치 선택
      await page.locator('button[role="menuitemradio"]:has-text("main")').click();
      await page.waitForTimeout(1000);

      // Folder 선택 (root)
      const folderButton = await page.locator('button[id*="folder-select"]').or(page.locator('summary:has-text("/ (root)")')).first();
      if (await folderButton.isVisible()) {
        await folderButton.click();
        await page.waitForTimeout(1000);
        await page.locator('button[role="menuitemradio"]:has-text("/ (root)")').click();
        await page.waitForTimeout(1000);
      }

      // Save 버튼 찾기 및 클릭
      const saveButton = await page.locator('button[type="submit"]:has-text("Save")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        console.log('   ✓ 설정을 저장했습니다.');
        await page.waitForTimeout(5000);
      }

    } catch (e) {
      console.log('   설정 변경 중 오류:', e.message);
      console.log('   수동으로 설정해야 할 수 있습니다.');
    }

    // 최종 상태 확인
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'github-pages-final-status.png', fullPage: true });

    // Pages URL 확인
    const pagesLink = await page.locator('a[href*="github.io"]').first();
    if (await pagesLink.isVisible()) {
      const url = await pagesLink.getAttribute('href');
      console.log(`\n✓ GitHub Pages가 활성화되었습니다!`);
      console.log(`  URL: ${url}`);
    } else {
      console.log('\n⚠️  GitHub Pages가 아직 활성화되지 않았습니다.');
      console.log('   몇 분 후에 다시 확인해보세요.');
    }

  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'error-enable-pages.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();