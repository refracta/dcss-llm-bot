const fs = require('fs');
const path = require('path');
const { encode } = require('gpt-3-encoder'); // 토큰 계산을 위한 gpt-3-encoder 패키지 사용

// 설정: 분할할 최대 토큰 수 설정 (2048 토큰)
const MAX_TOKENS = 2048;

// JSONL 파일을 저장할 경로
const outputFilePath = path.join(__dirname, 'output.jsonl');

// 텍스트의 토큰 수를 계산하는 함수
function countTokens(text) {
    return encode(text).length;
}

// 긴 데이터를 지정된 기준으로 분할하는 함수 (토큰 기준)
function splitDataByTokens(text, maxTokens) {
    const chunks = [];
    let currentChunk = '';

    // 우선적으로 \n이나 . 기준으로 나눔
    const sentences = text.split(/(\n|\.)/); // \n과 .을 기준으로 나누기 (구분자는 포함)

    sentences.forEach((sentence) => {
        // 현재 청크에 추가할 수 있는지 확인
        if (countTokens(currentChunk + sentence) <= maxTokens) {
            currentChunk += sentence;
        } else {
            // 추가할 수 없으면 청크를 저장하고 새로운 청크 시작
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        }
    });

    // 마지막 남은 청크 추가
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    // 분할된 청크가 여전히 너무 큰 경우 다시 자름
    const finalChunks = [];
    chunks.forEach(chunk => {
        if (countTokens(chunk) > maxTokens) {
            let tempChunk = '';
            const words = chunk.split(' '); // 너무 큰 청크는 단어 기준으로 나눔
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

// JSON 파일을 JSONL 형식으로 변환하여 출력하는 함수 (채팅 형식으로)
async function convertJsonToJsonl() {
    try {
        let files1 = fs.readdirSync('../chaosforge-wiki-crawler/extracted');
        files1 = files1.map(f => JSON.parse(fs.readFileSync(path.join('../chaosforge-wiki-crawler/extracted', f), 'utf8')));
        let files2 = fs.readdirSync('../namu/extracted');
        files2 = files2.map(f => JSON.parse(fs.readFileSync(path.join('../namu/extracted', f), 'utf8')));
        let files3 = JSON.parse(fs.readFileSync('../data/completions.json', 'utf8')).map(d => {
            d.title = `(DCSS RC OPTIONS) ${d.value}`;
            d.data = d.docText;
            return d;
        });
        const files = [...files1, ...files2, ...files3];

        // output.jsonl 파일 초기화
        fs.writeFileSync(outputFilePath, '');

        // 모든 JSON 파일을 처리
        for (const jsonData of files) {
            let { title, data } = jsonData;
            console.log(title);
            // 긴 데이터를 토큰 기준으로 분할
            const dataChunks = splitDataByTokens(data, MAX_TOKENS);

            // 분할된 데이터를 채팅 형식으로 변환
            dataChunks.forEach((chunk, index, array) => {
                const jsonlObject = {
                    messages: [
                        { "role": "user", "content": `${array.length > 1 ? `${title} - ${index + 1}` : title}` },
                        { "role": "assistant", "content": `${chunk.trim()}` }
                    ]
                };

                // JSONL 파일에 한 줄씩 쓰기
                fs.appendFileSync(outputFilePath, JSON.stringify(jsonlObject) + '\n');
            });
        }

        console.log(`모든 파일이 성공적으로 ${outputFilePath}에 저장되었습니다.`);
    } catch (error) {
        console.error('에러 발생:', error);
    }
}

// 스크립트 실행
convertJsonToJsonl();
