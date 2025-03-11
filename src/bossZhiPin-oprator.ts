import puppeteer from "puppeteer";
// import {PuppeteerAgent} from "@midscene/web/puppeteer";
import path from "node:path";
import dotenv from "dotenv";

const envPath = path.resolve(__dirname, "./.env")
dotenv.config({path: envPath});

const userDataDir = path.resolve(__dirname, "../user_data")

const main = async () => {
    const browser = await puppeteer.launch({
        // 设置为 false，可以看到浏览器窗口
        headless: false,
        // 设置浏览器尺寸
        defaultViewport: { width: 1500, height: 940 },
        args: [ '--window-size=1500,940', '--no-sandbox', '--disable-blink-features=AutomationControlled'],
        userDataDir, // 关键参数
    });
    // 打开 'https://www.zhipin.com/'网站
    const page = await browser.newPage();
    await page.goto('https://www.zhipin.com/web/chat/index');
    // const agent = new PuppeteerAgent(page);
    

    // document.querySelector('.user-list .geek-item .badge-count-common-less')

    // await agent.aiAssert("沟通列表有未读消息。如果有未读消息，对话列表的人物头像上会有一个红气泡，而且还有个数字");

    // Wait for the .user-list .geek-item elements to be rendered
    await page.waitForSelector('.user-list .geek-item');

    // Wait for the .badge-count-common-less elements within .user-list .geek-item with a timeout
    await page.waitForFunction(() => {
        const items = document.querySelectorAll('.user-list .geek-item');
        return Array.from(items).some(item => item.querySelector('.badge-count-common-less'));
    }, { timeout: 3000 }); // waits up to 10 seconds

    // Find the first .user-list .geek-item element with a .badge-count-common-less element
    const geekItemWithBadge = await page.evaluate(() => {
        const items = document.querySelectorAll('.user-list .geek-item');
        for (let item of items) {
            if (item.querySelector('.badge-count-common-less')) {
                const dataId = item.getAttribute('data-id');
                const geekNameElement = item.querySelector('.geek-name');
                const geekName = geekNameElement ? geekNameElement.textContent : 'No geek name';
                return { dataId, geekName };
            }
        }
        return null;
    });

    console.log('Geek item with badge data-id:', geekItemWithBadge?.dataId);
    console.log('Geek item with badge geek name:', geekItemWithBadge?.geekName);

    // await browser.close();
}

main()
