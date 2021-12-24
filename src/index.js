const puppeteer = require('puppeteer');
const mqtt = require('mqtt');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async function() {
    try {
        let usage = await getUsage();
        sendToMqtt(usage);
    } catch (e) {
        console.error(e);
        process.exit(0);
    }
})();

async function sendToMqtt(usage) {
    const host = process.env['MQTT_HOST'] || 'localhost';
    const port = process.env['MQTT_PORT'] || '1883';
    const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

    const connectUrl = `mqtt://${host}:${port}`

    const client = mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        username: process.env['MQTT_USERNAME'] || '',
        password: process.env['MQTT_PASSWORD'] || '',
        reconnectPeriod: 1000,
    });

    let topic = process.env['MQTT_TOPIC'] || "internet/usage";

    client.on('connect', () => {
        client.publish(topic, usage.toString(), { qos: 0, retain: false }, (error) => {
            if (error) {
            console.error(error)
            }
            client.end();
        })
    })
}

async function getUsage() {
    let browser = await puppeteer.launch({headless: true,
        defaultViewport: {
            width:1920,
            height:1080
          }});
    
    let page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36");
    await page.goto('https://login.xfinity.com/login');
    // await picture(page, 'initialLoadBefore');
    await page.waitForSelector('input[name=user]');
    // await picture(page, 'initialLoadAfter');
    sleep(1000);
    // await picture(page, 'initialLoadAfterWait');
    await page.focus('#user');
    await page.keyboard.type(process.env['COMCAST_USERNAME']);
    await picture(page, 'zzBeforeButton');
    await page.click('#sign_in');
    await picture(page, 'zzAfterLoginBeforeWait');
    await picture(page, 'zzAfterLogin');
    await page.waitForSelector('input[name=passwd]');
    await page.focus('#passwd');
    await page.keyboard.type(process.env['COMCAST_PASSWORD']);
    await page.click('#sign_in');
    
    await sleep(10000);
    
    await page.goto('https://customer.xfinity.com/');
    await sleep(10000);
    await page.goto('https://customer.xfinity.com/apis/csp/account/me/services/internet/usage?filter=internet');
    let content = JSON.parse(await page.$eval('*', (el) => el.innerText));
    let usage = content.usageMonths[content.usageMonths.length - 1].totalUsage;
    console.log(usage);

    await browser.close();
    return usage;
}

async function picture(page, name) {
    return sleep(1);
    // return page.screenshot({
    //             //path: `/pics/${name}.png`
    //             path: `${name}.png`
    //          })
}
