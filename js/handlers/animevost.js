import * as cheerio from 'https://cdn.jsdelivr.net/npm/cheerio@1.0.0-rc.12/+esm'

const $ = cheerio.load;

export function animevostHandler(page) {
    let $page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
    let $lastEpisode = page.match(/var data =.*/)[0];
    let lastEpisode = 'pusto';
    if ($lastEpisode.match(/-/g)) {
        lastEpisode = lastEpisode.match(/-/g).length - 1 + lastEpisode.match(/серия/g).length
    } else {
        lastEpisode = lastEpisode.match(/серия/g)?.length;
    }
    let lastEpisodeNum = lastEpisode ? lastEpisode : -1;
    let time = null;
    let newTitle = page.match(/id="nexttime"/) || $page('.shortstoryFuter').text().match('Онгоинги') || page.match(/miniInfo/) != null;
    if (page.match(/id="nexttime"/)) {
        time = parseInt(page.match(/var left = parseInt\([0-9]+/g)[0].match(/[0-9]+/)[0])
    }

    return {
        lastEpisodeNum,
        newTitle,
        time
    }
}