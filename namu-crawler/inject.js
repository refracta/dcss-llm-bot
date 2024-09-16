// ==UserScript==
// @name         NamuSaver
// @namespace    http://tampermonkey.net/
// @version      2024-09-16
// @description  try to take over the world!
// @author       You
// @match        https://namu.wiki/edit/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=namu.wiki
// @grant        none
// ==/UserScript==

function waitFor(vf, t = 1) {
    return new Promise(r => {
        let i = setInterval(async _ => {
            try {
                let v = vf();
                v = v instanceof Promise ? await v : v;
                if (v) {
                    clearInterval(i);
                    r(v);
                }
            } catch (e) {
            }
        }, t);
    });
}

function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

(async function () {
    'use strict';
    await waitFor(_ => Array.from(document.querySelectorAll('button')).find(e => e.textContent === 'RAW 편집'));
    Array.from(document.querySelectorAll('button')).find(e => e.textContent === 'RAW 편집').click();
    const data = Array.from(document.querySelectorAll('#app textarea')).find(e => e.classList.length === 0).value;
    const title = decodeURIComponent(location.href.replace('https://namu.wiki/edit/', '').replace('https://namu.wiki/new_edit_request/', ''));
    const filename = title.replaceAll(':', '：').replaceAll('/', '／').replaceAll('', '');
    downloadJSON(`${filename}.json`, {title, data});
})();
