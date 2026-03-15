import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        await page.goto('http://localhost:5176/leetcode/two-sum', { waitUntil: 'networkidle0' });
        
        const content = await page.content();
        if (content.includes('Blank Page') || content.length < 500) {
            console.log("Looks like a blank page. Content snippet:", content.substring(0, 500));
        } else {
            console.log("Page rendered. Length:", content.length);
        }
        
        await browser.close();
    } catch (err) {
        console.error("Puppeteer script failed:", err);
        process.exit(1);
    }
    process.exit(0);
})();
