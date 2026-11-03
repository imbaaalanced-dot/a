const {chromium} = require('playwright');
const assert = require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:393,height:852},deviceScaleFactor:1,hasTouch:true});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
    await page.locator('#menuCampaignBtn').click();
    await page.locator('#campaignMenu .level-gallery').waitFor();
    assert.equal(await page.locator('#campaignMenu .map-card:visible').count(),4);
    assert.equal(await page.locator('#level3Btn .level-gallery-title').textContent(),'Herdecke');
    assert.equal(await page.locator('#level3Btn .level-gallery-visual img').count(),0);
    await page.locator('.level-gallery-pages button').last().click();
    assert.equal(await page.locator('#campaignMenu .map-card:visible').count(),3);
    assert.equal(await page.locator('#level5Btn .level-gallery-title').textContent(),'Dortmund');
    assert.deepEqual(errors,[]);
    await page.screenshot({path:'/tmp/td2-gallery-smoke.png'});
    console.log('Gallery smoke: 4+3 cards, locked spoiler guard, navigation and zero page errors passed.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
