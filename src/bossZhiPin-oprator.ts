import puppeteer from "puppeteer";
import path from "node:path";


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
}

main()
