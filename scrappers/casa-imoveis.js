import puppeteer from "puppeteer";
import { delay } from "../utils/delay.js";

async function getImovelDetails(page, url) {
  await page.goto(url, { waitUntil: "networkidle2" });

  function extractNumber(str) {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }

  const photos = await page.$$eval(
    ".fotorama__nav__frame .fotorama__img",
    (imgs) => imgs.map((img) => img.src.trim())
  );

  let allPhotos = photos;
  if (!allPhotos.length) {
    allPhotos = await page.$$eval(".fotorama__img", (imgs) =>
      imgs.map((img) => img.src.trim())
    );
  }

  const content = await page
    .$eval("#WID11780_Block_1_central_left_2 .TextBox", (el) =>
      el.innerText.trim()
    )
    .catch(() => "");

  const area = await page
    .$eval("tr.area_total td.Value", (el) => el.innerText.trim())
    .catch(() => "");

  const type = await page
    .$eval("tr.category td.Value", (el) => el.innerText.trim())
    .catch(() => "");

  const bedrooms = await page
    .$eval("tr.bedroom td.Value", (el) => el.innerText.trim())
    .catch(() => "");

  const parking = await page
    .$eval("tr.garage td.Value", (el) => el.innerText.trim())
    .catch(() => "");

  return {
    photos: allPhotos,
    content,
    area,
    type,
    bedrooms: extractNumber(bedrooms),
    parking: +parking,
  };
}

const defaultConfig = {
  headless: true,
};

const config =
  process.env.NODE_ENV === "development"
    ? defaultConfig
    : {
        ...defaultConfig,
        executablePath: "/usr/bin/chromium-browser",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      };

export async function execute(url) {
  const browser = await puppeteer.launch({
    protocolTimeout: 120000,
    timeout: 120000,
    ...config,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  while ((await page.$("button.BtnShowMoreImovel")) !== null) {
    await page.click("button.BtnShowMoreImovel");
    await delay(2000);
    await page.waitForSelector("div.LI_Imovel", { timeout: 5000 });
  }

  const imoveis = await page.$$eval("div.LI_Imovel", (nodes) =>
    nodes.map((node) => {
      const getText = (selector) =>
        node.querySelector(selector)?.innerText.trim() || "";
      const getAttr = (selector, attr) =>
        node.querySelector(selector)?.getAttribute(attr) || "";

      const findText = (regex) =>
        Array.from(node.querySelectorAll("span, div"))
          .map((e) => e.innerText)
          .find((t) => t && regex.test(t)) || "";

      function formatPrice(priceStr) {
        if (!priceStr) return null;
        let cleaned = priceStr.replace(/[^\d,.-]/g, "");
        cleaned = cleaned.replace(/\./g, "").replace(",", ".");
        const value = parseFloat(cleaned);
        return isNaN(value) ? null : value;
      }

      function extractNumber(str) {
        const match = str.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
      }

      return {
        name: getText(".Title, .title"),
        address: getText(".Endereco"),
        price: formatPrice(getText(".Valor .value, .value")),
        link: getAttr("a", "href"),
        image: getAttr("img", "src"),
        forSale: node.innerText.includes("Venda") ? true : false,
        parking: findText(/(\d+).*(Vaga)/i).replace(/\D/g, ""),
        bathrooms: extractNumber(getText(".BATHROOM")),
        ref: getText(".ImovelId"),
      };
    })
  );

  for (const imovel of imoveis) {
    const link = imovel.link;

    const detailPage = await browser.newPage();
    const { photos, content, area, type, bedrooms, parking } =
      await getImovelDetails(detailPage, link);
    await detailPage.close();

    imovel.photos = photos;
    imovel.content = content;
    imovel.area = area;
    imovel.agency = "casa_imoveis";
    imovel.type = type;
    imovel.bedrooms = bedrooms;
    imovel.parking = parking;
  }

  await browser.close();

  return imoveis;
}
