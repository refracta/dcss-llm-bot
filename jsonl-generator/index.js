const fs = require('fs');
const path = require('path');
const { encode } = require('gpt-3-encoder');

const MAX_TOKENS = 2048;

const outputFilePath = path.join(__dirname, 'output.jsonl');

function countTokens(text) {
    return encode(text).length;
}

function splitDataByTokens(text, maxTokens) {
    const chunks = [];
    let currentChunk = '';

    const sentences = text.split(/(\n|\.)/);

    sentences.forEach((sentence) => {
        if (countTokens(currentChunk + sentence) <= maxTokens) {
            currentChunk += sentence;
        } else {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        }
    });

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    const finalChunks = [];
    chunks.forEach(chunk => {
        if (countTokens(chunk) > maxTokens) {
            let tempChunk = '';
            const words = chunk.split(' ');
            words.forEach(word => {
                if (countTokens(tempChunk + word) <= maxTokens) {
                    tempChunk += ` ${word}`;
                } else {
                    finalChunks.push(tempChunk.trim());
                    tempChunk = word;
                }
            });
            if (tempChunk.trim()) {
                finalChunks.push(tempChunk.trim());
            }
        } else {
            finalChunks.push(chunk);
        }
    });

    return finalChunks;
}

async function convertJsonToJsonl() {
    try {
        let files1 = fs.readdirSync('../chaosforge-wiki-crawler/extracted');
        files1 = files1.map(f => JSON.parse(fs.readFileSync(path.join('../chaosforge-wiki-crawler/extracted', f), 'utf8')));
        let files2 = fs.readdirSync('../namu-wiki-crawler/extracted');
        files2 = files2.map(f => JSON.parse(fs.readFileSync(path.join('../namu-wiki-crawler/extracted', f), 'utf8')));
        let files3 = JSON.parse(fs.readFileSync('../data/completions.json', 'utf8')).map(d => {
            d.title = `(DCSS RC OPTIONS) ${d.value}`;
            d.data = d.docText;
            return d;
        });
        let files4 = JSON.parse(fs.readFileSync('../learndb-crawler/result.json', 'utf8'));
        const files = [...files1, ...files2, ...files3, ...files4];

        fs.writeFileSync(outputFilePath, '');

        for (const jsonData of files) {
            let { title, data } = jsonData;
            console.log(title);
            const dataChunks = splitDataByTokens(data, MAX_TOKENS);

            dataChunks.forEach((chunk, index, array) => {
                const jsonlObject = {
                    messages: [
                        { "role": "user", "content": `${array.length > 1 ? `${title} - ${index + 1}` : title}` },
                        { "role": "assistant", "content": `${chunk.trim()}` }
                    ]
                };

                fs.appendFileSync(outputFilePath, JSON.stringify(jsonlObject) + '\n');
            });
        }

        console.log(`${outputFilePath}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

convertJsonToJsonl();
