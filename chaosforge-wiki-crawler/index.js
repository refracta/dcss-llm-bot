import * as fs from 'fs';
import {JSDOM} from "jsdom";
import fetch from 'node-fetch';
import { html2Markdown } from '@inkdropapp/html2markdown'

async function fetchAllItems() {
    let baseUrl = 'http://crawl.chaosforge.org';
    let url = `${baseUrl}/Special:AllPages?hideredirects=1`;
    let allItems = [];

    while (url) {
        console.log(`Fetching: ${url}`);
        const pageContent = await fetch(url).then(res => res.text());
        const document = new JSDOM(pageContent).window.document;

        const items = Array.from(document.querySelectorAll('.mw-allpages-body a'))
            .map(e => ({
                title: e.textContent,
                url: new URL(e.getAttribute('href'), baseUrl).href
            }));
        allItems = allItems.concat(items);

        const navLinks = Array.from(document.querySelectorAll('.mw-allpages-nav a'));
        const nextLink = navLinks.find(link => link.textContent.includes('Next page'));

        if (nextLink) {
            url = new URL(nextLink.getAttribute('href'), baseUrl).href;
        } else {
            url = null;
        }
    }

    return allItems;
}

const allItems = await fetchAllItems();
for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    console.log(item, i, allItems.length);
    const rawPageURL = item.url + '?action=raw';
    let page = await fetch(rawPageURL).then(r => r.text());
    const data = {...item};
    if (page.includes('<title>Forbidden</title>') || true) {
        const rawPage = page;
        page = await fetch(item.url).then(r => r.text());
        const document = new JSDOM(page).window.document;
        const output = document.querySelector('.mw-parser-output').innerHTML;
        const content = html2Markdown(output);
        data.type = 'markdown';
        data.data = content;
        data.html = page;
        data.rawPage = rawPage;
    } else {
        data.type = 'raw';
        data.data = page;
    }
    try {
        fs.writeFileSync(`extracted/${data.title}.json`, JSON.stringify(data), 'utf8')
        // OKB CHECK ':'
    } catch (e){
        fs.writeFileSync(`extracted/${encodeURIComponent(data.title)}.json`, JSON.stringify(data), 'utf8')
    }
}
