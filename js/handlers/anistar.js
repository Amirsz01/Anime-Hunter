const {load} = require('cheerio')

const $ = load

function anistarHandler(page) {
    let $page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
    let $lastEpisode = $page('.torrent .info_d1:first');
    let lastEpisodeNum = $lastEpisode.text().match(/[0-9]+/i) ? parseInt($lastEpisode.text().match(/[0-9]+/i)[0]) : -1;
    let searchInDesc = $page('.descripts .reason').text().match(/.*авлен[\D]*(\d+).*сер.*/)[1] ?? -1
    lastEpisodeNum = lastEpisodeNum === -1 ? parseInt(searchInDesc) : lastEpisodeNum
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

module.exports = {anistarHandler}