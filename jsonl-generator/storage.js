const fs = require('fs');
const path = require('path');

let files1 = fs.readdirSync('../chaosforge-wiki-crawler/extracted');
files1 = files1.map(f => {
    console.log(f);
    const data = JSON.parse(fs.readFileSync(path.join('../chaosforge-wiki-crawler/extracted', f), 'utf8'));
    delete data.html;
    return data;
});
let files2 = fs.readdirSync('../namu-wiki-crawler/extracted');
files2 = files2.map(f => JSON.parse(fs.readFileSync(path.join('../namu-wiki-crawler/extracted', f), 'utf8')));
let files3 = JSON.parse(fs.readFileSync('../data/completions.json', 'utf8')).map(d => {
    d.title = `(DCSS RC OPTIONS) ${d.value}`;
    d.data = d.docText;
    return d;
});
let files4 = JSON.parse(fs.readFileSync('../learndb-crawler/result.json', 'utf8'));
const files = [...files1, ...files2, ...files3, ...files4];
fs.writeFileSync('storage/dcss.json', JSON.stringify(files, null, 4), 'utf8')
fs.writeFileSync('storage/crawl.chaosforge.org-1.json', JSON.stringify(files1.slice(0, 1000), null, 4), 'utf8')
fs.writeFileSync('storage/crawl.chaosforge.org-2.json', JSON.stringify(files1.slice(1000, 2000), null, 4), 'utf8')
fs.writeFileSync('storage/crawl.chaosforge.org-3.json', JSON.stringify(files1.slice(2000, 3000), null, 4), 'utf8')
fs.writeFileSync('storage/namu.wiki.json', JSON.stringify(files2, null, 4), 'utf8')
fs.writeFileSync('storage/dcss-rc.json', JSON.stringify(files3, null, 4), 'utf8')
fs.writeFileSync('storage/learndb.json', JSON.stringify(files4, null, 4), 'utf8')
