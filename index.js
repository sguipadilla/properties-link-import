const puppeteer = require("puppeteer");
const express = require("express")

const app = express();
const url = "https://www.zapimoveis.com.br/imobiliaria/74969/?transacao=venda&pagina=1";
const port = 3001;

app.get("/properties", async (req, res) => {
    try {
const posts = await scrapeProperties();
res.status(200).json({ posts }) 
    } catch(error) {
        res.status(500).json({
            message: "Error fetching properties"
        });
    }
});

    
async function scrapeProperties() {
    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    
    await page.waitForSelector('.ListingCard_result-card__Pumtx');

    const posts = await page.evaluate(async () => {

        await new Promise(resolve => {
            const distance = 100;
            let scrolledAmount = 0;
         

            const timer = setInterval(() => {
                window.scrollBy(0, distance);    
                scrolledAmount += distance;

                if (scrolledAmount >= document.body.scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }


            }, 100);

        })

        const posts = Array.from(document.querySelectorAll(".ListingCard_result-card__Pumtx"));
        
        const data = posts.map((post) => {
            const link = post.querySelector("a[itemprop='url']");
            return {
                url: link ? link.getAttribute("href") : null
            };
        });

        return data.filter(item => item.url);
    });

    await browser.close();
    return posts;
}

app.listen(port, () => {
    console.log(`servidor rodando na porta ${port}`);
});

