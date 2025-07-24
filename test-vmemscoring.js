const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1. GitHub Pages URL 테스트...');
    
    // 먼저 404 확인
    const response = await page.goto('https://psykim.github.io/VERBAL_LEARNING/VMEMSCORING.html', {
      waitUntil: 'networkidle'
    });
    
    console.log(`   상태 코드: ${response.status()}`);
    
    if (response.status() === 404) {
      console.log('   ✗ 여전히 404 오류입니다. GitHub Pages 활성화를 기다립니다...');
      
      // GitHub 저장소 페이지 확인
      await page.goto('https://github.com/psykim/VERBAL_LEARNING');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'github-repo-check.png', fullPage: true });
      
      // Settings 페이지로 이동해서 Pages 확인
      console.log('\n2. GitHub 로그인 및 Pages 설정 확인...');
      await page.goto('https://github.com/login');
      await page.fill('input[name="login"]', 'psykim');
      await page.fill('input[name="password"]', 'Mhrk0315@');
      await page.click('input[type="submit"]');
      
      await page.waitForTimeout(3000);
      
      // Pages 설정 페이지로 직접 이동
      await page.goto('https://github.com/psykim/VERBAL_LEARNING/settings/pages');
      await page.waitForTimeout(3000);
      
      // 스크린샷
      await page.screenshot({ path: 'github-pages-status.png', fullPage: true });
      
      // Pages 활성화 상태 확인
      const pagesUrl = await page.locator('a[href*="psykim.github.io/VERBAL_LEARNING"]').textContent().catch(() => null);
      if (pagesUrl) {
        console.log(`   ✓ GitHub Pages URL: ${pagesUrl}`);
      }
      
    } else {
      console.log('   ✓ 페이지가 정상적으로 로드되었습니다!');
      
      // 페이지 내용 확인
      await page.waitForTimeout(2000);
      const title = await page.textContent('h1');
      console.log(`   페이지 제목: ${title}`);
      
      // 스크린샷
      await page.screenshot({ path: 'vmemscoring-main.png', fullPage: true });
      
      // 각 도구 링크 테스트
      console.log('\n3. 개별 도구 페이지 테스트...');
      
      // Calculator 페이지
      await page.click('a[href="VMEMSCORING-calculator.html"]');
      await page.waitForTimeout(2000);
      const calcTitle = await page.textContent('h1');
      console.log(`   ✓ Calculator 페이지: ${calcTitle}`);
      await page.screenshot({ path: 'vmemscoring-calculator.png' });
      
      // 뒤로 가기
      await page.goBack();
      await page.waitForTimeout(1000);
      
      // CERAD Analyzer 페이지
      await page.click('a[href="VMEMSCORING-cerad-analyzer.html"]');
      await page.waitForTimeout(2000);
      const ceradTitle = await page.textContent('h1');
      console.log(`   ✓ CERAD Analyzer 페이지: ${ceradTitle}`);
      await page.screenshot({ path: 'vmemscoring-cerad.png' });
    }
    
    // 대체 URL 테스트
    console.log('\n4. 대체 URL 테스트...');
    const urls = [
      'https://psykim.github.io/VERBAL_LEARNING/',
      'https://psykim.github.io/VERBAL_LEARNING/index.html',
      'https://psykim.github.io/VERBAL_LEARNING/VMEMSCORING.html'
    ];
    
    for (const url of urls) {
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      console.log(`   ${url}: ${response.status()}`);
    }

  } catch (error) {
    console.error('오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n테스트 완료. 스크린샷을 확인하세요.');
  }
})();