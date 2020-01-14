const puppeteer = require("puppeteer");

const clickAndDownload = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false
    })
    const page = await browser.newPage()
    await page.goto('https://echanges.dila.gouv.fr/OPENDATA/BALO/FluxHistorique/2016/')
    await page.waitForSelector('body > pre > a')
    let newUrls = await page.evaluate(() => {
      let results = [];
      let items = document.querySelectorAll('body > pre > a');
      for (item of items) {
        results.push(item.getAttribute("href"))
      };
      return results;
    });
    for await (url of newUrls) {
      let ext = url.split('.')
      if (ext[1] === 'taz')
        await page.click("body > pre > a[href='" + url + "']")
    }
  } catch (error) {
    console.error(error)
  }
  await browser.close();
}

clickAndDownload()