
const crypto = require("crypto")
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const { uniqueNamesGenerator, adjectives, colors, animals, countries, names, languages, starWars } = require('unique-names-generator')
const { PuppeteerBlocker } = require('@cliqz/adblocker-puppeteer')
const {fetch} = require('cross-fetch')
const fs = require('fs')
const { Console } = require('console')

const captchakey = ''
const PROXY_ADDR = ''
const PROXY_USERNAME = ''
const PROXY_PASSWORD = ''
const BROWSER_CONFIG = {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=1,1',
    "--proxy- =" + PROXY_ADDR,
    '--window-size=679,768',
  ],
  defaultViewport: null,
  ignoreHTTPSErrors: true,
  headless: false,
}

puppeteer.use(StealthPlugin())

puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: captchakey,
    },
    visualFeedback: true,
    throwOnError: true
  })
)

process.title = `Discord Token Gen Mırracan#0001`

var repeat = 1
if (repeat < 2) {
  const o = fs.createWriteStream('./errors.log', {flags:'a'})
  const errorOutput = fs.createWriteStream('./errors.log', {flags:'a'})
  const accounts = fs.createWriteStream('tokens.txt', {flags:'a'})
  const logger = new Console(o, errorOutput)

  const t0 = process.hrtime();
  function write_log(goodnews, text){
    const t1 = process.hrtime(t0);
    const time = (t1[0]* 1 + t1[1]) / 1;
    const color = goodnews ? "\x1b[31m" : "\x1b[32m";

    console.log(`${text}`);
    logger.log(`[ERROR] ${text}`);
  }

  async function fill_input(page, infoname, info){
    const p = await page.$('input[name=' + infoname + ']');
    await p.focus();
    await page.keyboard.type(info);
  }

  async function click_date(page, name, min, max) {
    var i = await page.$('[class*=input' + name + "]");
    await i.click();
    var r = Math.floor(Math.random() * (max - min + 1)) + min;

    await page.waitForSelector('[class*=option]');
    await page.$eval("[class$=option]", function(e, r){e.parentNode.childNodes[r].click()}, r);

    return r
  }

  async function fill_discord(DiscordPage, username, password, email){
    await DiscordPage.bringToFront();
    await DiscordPage.goto('https://discord.com/register', {"waitUntil" : "networkidle0", timeout: 70000});

    write_log(true, "                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mDiscord Token Nearly Finished...!");
    await click_date(DiscordPage, "Year", 15,15 );
    await click_date(DiscordPage, "Day", 22, 22);
    await click_date(DiscordPage, "Month", 06, 06);

    DiscordPage.waitForSelector('input[type*=checkbox]').then(() => {
      DiscordPage.$eval('input[type*=checkbox]', el => el.click());
    }).catch(e => {});

    await fill_input(DiscordPage, "username", username);
    await fill_input(DiscordPage, "password", password);
    await fill_input(DiscordPage, "email", email);
    await DiscordPage.$eval('button[type=submit]', (el) => el.click());
  }

  const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  async function break_captcha(DiscordPage){
    try {
      await DiscordPage.waitForSelector('[src*=sitekey]');
      write_log(true, "                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mCaptcha Kırıldı!");
      await DiscordPage.addScriptTag({content: `hcaptcha.execute()`})

      while(true){
        try{
          await DiscordPage.solveRecaptchas();
          var t;

          write_log(true, "");
          return true;
        } catch(err) {
          write_tt(false, "");
          sleep(3000);
        }
      }
    } catch(e){
      write_log(true, "                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[33mCaptcha Kırılamadı...");
    };
  }

  async function generate_email(MailPage){
    write_log(true, "                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mMail Oluşturuluyor...");
    write_log(true, "                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mMail Mail Yükleniyor...");
    PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
      blocker.enableBlockingInPage(MailPage);
    });

    await MailPage.bringToFront();
    await MailPage.goto("https://temp-mail.org/tr/", { waitUntil: 'networkidle2', timeout: 0});
    var info_id = "#mail";

    try {
      await MailPage.waitForSelector(info_id);
      await MailPage.waitForFunction((info_id) => document.querySelector(info_id).value.indexOf("@") != -1, {}, info_id);
      
      var email = await MailPage.$eval('#mail', el => el.value);
      return email;
    } catch(e){
      console.log("Found Error - Mail Generation...");
      return false;
    };
  }

  async function validate_email(MailPage){
    write_log(true, "                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mMail Onaylanıyor...");
    await MailPage.bringToFront();

    while(true){
      await MailPage.mouse.wheel({ deltaY: (Math.random()-0.5)*200 });

      try {
        await MailPage.waitForSelector('[title*=Discord]', {timeout: 500});
        sleep(1000);
        await MailPage.$eval('[title*=Discord]', e => e.parentNode.click());
      
        await MailPage.waitForSelector("td > a[href*='discord'][style*=background]");
        const elem = await MailPage.$eval("td > a[href*='discord'][style*=background]", el => el.href);
      
        return elem;
      } catch(e){};
    }
  }

  async function verif_compte(browser, link){
    const page = await browser.newPage();
    await page.goto(link, {"waitUntil" : "networkidle0", "timeout": 60000});
    break_captcha(page);
  }

  async function create_accinfos(browser, d) {
    // Options
    const username = 'Mirro Code';
    const password = crypto.randomBytes(16).toString('hex');
    const MailPage = (await browser.pages())[0];
    var email;

    while(!email){
      try {
        email = await generate_email(MailPage);
      } catch(e){};
    }

    write_log(true, `                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mMail: ${email}`);
    write_log(true, `                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mŞifre: ${password}`);
    write_log(true, `                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mİsim: ${username}`);

    // Create acc, pass captcha
    const DiscordPage = d;
    await fill_discord(DiscordPage, username, password, email);

    const client = d._client;
    var token;

    client.on('Network.webSocketFrameSent', ({requestId, timestamp, response}) => {
      try {
        const json = JSON.parse(response.payloadData);
        if(!token && json["d"]["token"]){
          token = json["d"]["token"];
          write_log(true, `                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mHesap Tokeni: ${token}`);
        };
      } catch(e){};
    })
    await break_captcha(DiscordPage);

    // Verify email
    let page_a_valider = await validate_email(MailPage);
    await verif_compte(browser, page_a_valider);
    write_log(true, "                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mToken Onaylandı");

    if(!token){
      write_log(false, "Trying To Find Token")
      await DiscordPage.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    };

    return `${token}`;
  }
  (async () => {
    console.log(`
Yükleniyor...
	`);
    const browser = await puppeteer.launch(BROWSER_CONFIG);

    try {
      const page = await browser.newPage();
    
      await page.authenticate({
        username: PROXY_USERNAME,
        password: PROXY_PASSWORD
      });

      await page.goto('https://www.youtube.com/channel/UC1TUBotkfhGrAaNmoI-XH9Q');
      const infos = await create_accinfos(browser, page);
      write_log(true, "                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mTamamlandı");
      accounts.write(infos + "\n");
    } catch(e) {
      console.log(e);
    } finally {
      write_log(true, "                                  \x1B[36m[\x1B[36m\x1B[37m>>>\x1B[37m\x1B[36m]\x1B[36m \x1B[37mLütfen Daha Fazla Token Oluşturmak için Programı Yeniden Başlatın...!");
      try{
        sleep(1)
      } catch(e){};
    }
  })();
}


/*
async function check_proxy(file){
  var proxy = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    output: process.ERRORS,
    console: true
  });
  for await (const line of rl) {
    var s = line.split(":");
    if(s.length == 0){
      continue;
    }
  };
  return proxy;
}
*/
