const {load} = require('cheerio')

const $ = load

function animyHandler(page) {
    let $page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, '').replace(/<iframe.*?<\/iframe>/g, ''));
    let $lastEpisode = $page('#one-panel>ul>li')?.length;
    let lastEpisodeNum = $lastEpisode ? $lastEpisode : -1;
    let time = null;
    let newTitle = true;

    return {
        lastEpisodeNum,
        newTitle,
        time
    }
}

module.exports = {animyHandler}