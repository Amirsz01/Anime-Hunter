import * as cheerio from 'https://cdn.jsdelivr.net/npm/cheerio@1.0.0-rc.12/+esm'

const $ = cheerio.load;

export function anistarHandler(page) {
    let $page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
    let $lastEpisode = $page('.torrent .info_d1:first');
    let lastEpisodeNum = $lastEpisode.text().match(/[0-9]+/i) ? parseInt($lastEpisode.text().match(/[0-9]+/i)[0]) : -1;
    let $tags = $page('.tags').text();
    // $tags = iconv.encode(iconv.decode(new Buffer($tags, 'binary'), 'win1251'), 'utf8').toString();
    //  base[site][key]['time'] != null
    let newTitle = ($tags.match(/онгоинги/) || $tags.match(/Скоро/)) != null;
    let time = null;

    if (page.match(/var left = parseInt\([0-9]+/g)) {
        time = parseInt(page.match(/var left = parseInt\([0-9]+/g)[0].match(/[0-9]+/)[0]);
    }

    return {
        lastEpisodeNum,
        newTitle,
        time
    }
}