// https://namu.wiki/w/%EB%B6%84%EB%A5%98:%EB%8D%98%EC%A0%84%20%ED%81%AC%EB%A1%A4
// https://namu.wiki/w/%EB%B6%84%EB%A5%98:%EB%8D%98%EC%A0%84%20%ED%81%AC%EB%A1%A4/%EC%B6%94%EA%B0%80%EC%A3%BD
const data = Array.from(document.querySelectorAll('a'))
    .filter(e => e.title && e.href.startsWith('https://namu.wiki/w/') && e.classList.length === 0).map(e => ({
        title: e.title, href: e.href
    }));
localStorage.data ||= '[]';
const sData = JSON.parse(localStorage.data).map(d => JSON.stringify(d));
const oData = data.map(d => JSON.stringify(d));
const s = Array.from(new Set([...sData, ...oData]));
const v = s.map(d => JSON.parse(d));
localStorage.data = JSON.stringify(v);
console.log(JSON.stringify(v, null, 4));


