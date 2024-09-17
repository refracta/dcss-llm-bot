import * as fs from 'fs';
import {JSDOM} from "jsdom";
import fetch from 'node-fetch';
import { html2Markdown } from '@inkdropapp/html2markdown'


const learndb = await fetch('https://loom.shalott.org/learndb.html').then(r => r.text());
const document = new JSDOM(learndb).window.document;
const titles = Array.from(document.querySelectorAll('dt')).map(e => e.textContent.trim());
const dataList = Array.from(document.querySelectorAll('dd')).map(e => html2Markdown(e.innerHTML));
const result = titles.map((title, index) => ({title, data: dataList[index]}));
fs.writeFileSync('result.json', JSON.stringify(result, null, 4), 'utf8');
