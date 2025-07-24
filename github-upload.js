const { chromium } = require('playwright');

(async () => {
    console.log('=== GitHub Repository 생성 및 파일 업로드 ===');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 // 동작을 천천히 수행
    });
    
    const page = await browser.newPage();
    
    try {
        // 1. GitHub 로그인 페이지로 이동
        console.log('\n1. GitHub 로그인 페이지로 이동...');
        await page.goto('https://github.com/login');
        await page.waitForTimeout(2000);
        
        // 로그인이 필요한 경우 수동으로 진행하도록 대기
        console.log('\n📌 브라우저에서 GitHub에 로그인해주세요.');
        console.log('로그인 완료 후 Enter 키를 눌러주세요...');
        
        // 로그인 확인 대기
        await page.waitForSelector('img[alt*="@"]', { timeout: 120000 });
        console.log('✅ 로그인 확인됨');
        
        // 2. 새 repository 생성 페이지로 이동
        console.log('\n2. 새 repository 생성 페이지로 이동...');
        await page.goto('https://github.com/new');
        await page.waitForTimeout(2000);
        
        // 3. Repository 정보 입력
        console.log('\n3. Repository 정보 입력...');
        
        // Repository 이름 입력
        await page.fill('input[name="repository[name]"]', 'VERBAL_LEARNING');
        
        // Description 입력
        await page.fill('input[name="repository[description]"]', 'Verbal Learning Test Calculator - 언어학습검사 계산기');
        
        // Public 선택 (기본값)
        const publicRadio = await page.$('input[value="public"]');
        if (publicRadio) {
            await publicRadio.click();
        }
        
        // Initialize with README 체크
        const readmeCheckbox = await page.$('input[name="repository[auto_init]"]');
        if (readmeCheckbox) {
            await readmeCheckbox.click();
        }
        
        // 4. Repository 생성
        console.log('\n4. Repository 생성 중...');
        await page.click('button[type="submit"]:has-text("Create repository")');
        
        // Repository 생성 완료 대기
        await page.waitForSelector('strong[itemprop="name"] a', { timeout: 30000 });
        console.log('✅ Repository 생성 완료!');
        
        // 5. Repository URL 확인
        const repoUrl = page.url();
        console.log(`\n📌 생성된 Repository URL: ${repoUrl}`);
        
        console.log('\n=== 다음 단계 ===');
        console.log('1. 터미널에서 VERBAL_LEARNING 폴더로 이동:');
        console.log('   cd /Users/kwk/development/VERBAL_LEARNING');
        console.log('\n2. Git 초기화 및 파일 추가:');
        console.log('   git init');
        console.log('   git add .');
        console.log('   git commit -m "Initial commit: Add Verbal Learning Test files"');
        console.log('\n3. Remote 추가 및 Push:');
        console.log(`   git remote add origin ${repoUrl}.git`);
        console.log('   git branch -M main');
        console.log('   git push -u origin main');
        
    } catch (error) {
        console.error('오류 발생:', error);
    }
    
    console.log('\n브라우저를 닫으려면 Enter 키를 누르세요...');
    await page.waitForTimeout(300000); // 5분 대기
})();