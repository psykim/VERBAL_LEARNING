const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('GitHub Pages 최종 테스트...\n');
    
    // 시간을 두고 여러 번 시도
    const urls = [
      'https://psykim.github.io/VERBAL_LEARNING/',
      'https://psykim.github.io/VERBAL_LEARNING/index.html',
      'https://psykim.github.io/VERBAL_LEARNING/VMEMSCORING.html'
    ];
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`시도 ${attempt}/3:`);
      
      for (const url of urls) {
        try {
          const response = await page.goto(url, { 
            waitUntil: 'networkidle',
            timeout: 10000 
          });
          
          console.log(`  ${url}: ${response.status()}`);
          
          if (response.status() === 200) {
            console.log('  ✓ 페이지가 정상적으로 로드되었습니다!');
            await page.screenshot({ path: `success-${attempt}.png`, fullPage: true });
            
            // 페이지 내용 확인
            const title = await page.textContent('h1').catch(() => 'N/A');
            console.log(`  페이지 제목: ${title}`);
            
            // 성공하면 종료
            await browser.close();
            return;
          }
        } catch (e) {
          console.log(`  ${url}: 오류 - ${e.message}`);
        }
      }
      
      if (attempt < 3) {
        console.log('\n30초 후 재시도...\n');
        await page.waitForTimeout(30000);
      }
    }
    
    console.log('\n⚠️  GitHub Pages가 아직 활성화되지 않았습니다.');
    console.log('다음을 확인해주세요:');
    console.log('1. https://github.com/psykim/VERBAL_LEARNING/settings/pages 에서');
    console.log('   - Source: Deploy from a branch');
    console.log('   - Branch: main');
    console.log('   - Folder: / (root)');
    console.log('   설정되어 있는지 확인');
    console.log('2. 설정 후 5-10분 정도 기다려야 할 수 있습니다.');

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await browser.close();
  }
})();