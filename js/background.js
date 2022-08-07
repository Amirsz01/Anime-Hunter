const $ = require('cheerio').load;

const duration = 10000;

let allsites = ['anistar', 'animevost', 'anilibria', 'anidub', 'animy', 'urls'];

let freezeTime = {'anistar': 0, 'animevost': 0, 'anilibria': 0, 'anidub': 0, 'animy': 0};

let correctUrls = {};

const getObjectFromLocalStorage = async function (key) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(key, function (value) {
                resolve(value[key]);
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

/**
 * Save Object in Chrome's Local StorageArea
 * @param {*} obj
 */
const saveObjectInLocalStorage = async function (obj) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.set(obj, function () {
                resolve();
            });
        } catch (ex) {
            reject(ex);
        }
    });
};

chrome.storage.local.get(null, (result) => {
    console.log(result);
});

Object.size = function (obj) {
    let size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
Object.renameProperty = function (oldName, newName) {
    // Do nothing if the names are the same
    if (oldName === newName) {
        return this;
    }
    // Check for the old property name to avoid a ReferenceError in strict mode.
    if (this.hasOwnProperty(oldName)) {
        this[newName] = this[oldName];
        delete this[oldName];
    }
    return this;
};

const getStorage = function (site, callback) {
    chrome.storage.local.get(site, function (data) {
        callback(data);
    })
};
const setStorage = function (url, num, site, time) {
    getStorage(site, function (base) {
        if (num != null)
            base[site][url]['epizodes'] = num;
        base[site][url]['time'] = time;
        chrome.storage.local.set(base);
    });
};
const parse = function (key, site) {
    getStorage(site, async function (base) {
        if (base[site][key] === undefined || base[site][key] == null || base[site][key]['time'] === 'end' || freezeTime[site] > new Date().getTime()) {
            return;
        }
        if (site === 'anidub') {
            key = 'https://mycoub.ru/api-grabbing?url=' + key;
        }

        let response = await fetch(key);

        if (response.ok) {
            let page = await response.text();
            switch (site) {
                case 'anistar':
                    $page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
                    $lastEpisode = $page('.torrent .info_d1:first');
                    $lastEpisode.text().match(/[0-9]+/i) != null ? lastEpisodeNum = parseInt($lastEpisode.text().match(/[0-9]+/i)[0]) : lastEpisodeNum = -1;
                    $newTitle = $page('.tags').text();
                    $newTitle.match(/онгоинги/) || $newTitle.match(/Скоро/) != null || base[site][key]['time'] != null ? $newTitle = true : $newTitle = false;
                    time = null;
                    if (page.match(/var left = parseInt\([0-9]+/g)) {
                        time = parseInt(page.match(/var left = parseInt\([0-9]+/g)[0].match(/[0-9]+/)[0]);
                    } else {
                        time = null;
                    }
                    break;
                case 'animevost':
                    $page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
                    lastEpisode = page.match(/var data =.*/)[0];
                    if (lastEpisode.match(/-/g)) {
                        $lastEpisode = lastEpisode.match(/-/g).length - 1 + lastEpisode.match(/серия/g).length
                    } else {
                        if (lastEpisode.match(/серия/g)) {
                            $lastEpisode = lastEpisode.match(/серия/g).length;
                        } else {
                            $lastEpisode = 'pusto';
                        }
                    }
                    $lastEpisode != null ? lastEpisodeNum = parseInt($lastEpisode) : lastEpisodeNum = -1;
                    page.match(/id="nexttime"/) || $page('.shortstoryFuter').text().match('Онгоинги') || page.match(/miniInfo/) != null ? $newTitle = true : $newTitle = false;
                    if (page.match(/id="nexttime"/)) {
                        time = parseInt(page.match(/var left = parseInt\([0-9]+/g)[0].match(/[0-9]+/)[0])
                    } else {
                        time = null;
                    }
                    break;
                case 'anilibria':
                    $page = $(page.replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
                    $lastEpisode = $page('.torrentcol1:last').text().split('[')[0].split('-');
                    if ($lastEpisode[$lastEpisode.length - 1]) {
                        $lastEpisode = $lastEpisode[$lastEpisode.length - 1].match(/[0-9]+/g)[0]
                    } else {
                        $lastEpisode = null
                    }
                    $lastEpisode != null ? lastEpisodeNum = parseInt($lastEpisode) : lastEpisodeNum = -1;
                    page.match(/В работе/) || page.match(/Не начат/) != null ? $newTitle = true : $newTitle = false;
                    time = null;
                    break;
                case 'anidub':
                    $page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, '').replace(/<iframe.*?<\/iframe>/g, ''));
                    $range = $page('.fright>h1').text().match(/[0-9]+\sиз\s[0-9]+/g);
                    if ($range)
                        $newTitle = $range.filter(function (e, i) {
                            return e.split(' из ')[0] != e.split(' из ')[1]
                        }).length;
                    if ($page('.series-tab.active>span')[0] !== undefined)
                        $lastEpisode = $page('.series-tab.active>span')[0].length;
                    else
                        $lastEpisode = null;
                    $lastEpisode != null ? lastEpisodeNum = parseInt($lastEpisode) : lastEpisodeNum = -1;
                    if ($page('.fright>h1').text().indexOf('xxx') !== -1 || $page('.fright>h1').text().indexOf('ххх') !== -1)
                        $newTitle = true;
                    time = null;
                    //$('#sel')[0].length
                    break;
                case 'animy':
                    $page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, '').replace(/<iframe.*?<\/iframe>/g, ''));
                    $lastEpisode = $page('#one-panel>ul>li').length;
                    $lastEpisode != null ? lastEpisodeNum = parseInt($lastEpisode) : lastEpisodeNum = -1;
                    time = null;
                    $newTitle = true;
                    break;
            }

            var body = '';
            if ($newTitle) {
                if (base[site][key]['epizodes'] === 'pusto') {
                    setStorage(key, lastEpisodeNum, site, time);
                } else if (base[site][key]['epizodes'] < lastEpisodeNum) {
                    setStorage(key, lastEpisodeNum, site, time);
                    body = 'Вышла новая ' + lastEpisodeNum + ' серия!';
                    notifyMe(key, base[site][key]['name'], body, base[site][key]['image'])
                } else {
                    if (base[site][key]['time'] !== time) {
                        setStorage(key, lastEpisodeNum, site, time);
                    }
                }
            } else {
                if (base[site][key]['epizodes'] < lastEpisodeNum) {
                    time = 'end';
                    setStorage(key, lastEpisodeNum, site, time);
                    body = 'Вышла новая ' + lastEpisodeNum + ' серия!';
                    notifyMe(key, base[site][key]['name'], body, base[site][key]['image'])
                }
                //removeStorage(key, 2, site)//Удалить аниме, т.к оно закончилось
            }
        } else {
            if (freezeTime[site] < new Date().getTime())
                correctDomain(site, key);
        }
    })
};

const createStorage = function () {
    chrome.storage.local.set({
        'anistar': {},
        'animevost': {},
        'anilibria': {},
        'anidub': {},
        'urls': {}
    })
};

const checker = function (site, castDuration) {
    let i = 0;
    if (site === 'urls')
        return;
    getStorage(site, function (base) {
        if (base !== undefined || base !== null) {
            let animeList = base[site];
            for (let title in animeList) {
                i++;
                (function (i, title, site) {
                    setTimeout(function () {
                        parse(title, site);
                    }, (castDuration * i));
                })(i, title, site);
            }
        } else {
            createStorage()
        }
    })
};


const addNewSite = function (site) {
    getStorage(site, function (base) {
        base[site] = {};
        chrome.storage.local.set(base);
        if (site === "urls")
            correctUrlsFunc();
    });
};
const getSite = function (url) {
    if (url.indexOf(correctUrls['anilibria']) !== -1) {
        return 'anilibria'
    } else if (url.indexOf(correctUrls['anidub']) !== -1) {
        return 'anidub'
    } else if (url.indexOf(correctUrls['animy']) !== -1) {
        return 'animy'
    } else if (url.indexOf(correctUrls['anistar'].match(/[^.]*.[^.]*$/)[0]) !== -1) {
        return 'anistar'
    } else if (url.indexOf(correctUrls['animevost'].match(/[^.]*.[^.]*$/)[0]) !== -1) {
        return 'animevost'
    } else {
        return 'error'
    }
};


const addNewAnime = function (url, num, site, image, name, time) {
    getStorage(site, function (base) {
        base[site][url] = {};
        base[site][url]['epizodes'] = num;
        base[site][url]['image'] = image;
        base[site][url]['name'] = name;
        base[site][url]['time'] = time;
        chrome.storage.local.set(base);
    });
};


const checkStorage = function () {
    allsites.forEach(function (e) {
        getStorage(e, function (base) {
            if ((base[e] == null) || (base[e] === undefined) || (Object.keys(base).length === 0)) {
                addNewSite(e);
                console.log('Добавлен новый сайт ' + e);
            } else if (e == 'urls') {
                correctUrlsFunc();
            }
        })
    })
};
//type 1 - Отписка
//type 2 - Закончилось
const removeStorage = function (url, type, site) {
    getStorage(site, function (base) {
        switch (type) {
            case 1: {
                break;
            }
            case 2: {
                let body = 'Аниме полностью вышло и мы его удалили!';
                notifyMe(url, base[site][url]['name'], body, base[site][url]['image']);
                break
            }
        }
        if (base[site][url] === undefined || base[site][url] == null) {
            let path = new URL(url).pathname;
            for (var key in base[site]) {
                if (key.indexOf(path) !== -1) {
                    delete base[site][key];
                    break;
                }
            }
        } else {
            delete base[site][url];
        }
        chrome.storage.local.set(base);
    })
};


var output;
chrome.runtime.onMessage.addListener(function (request) {
    console.log(request);
    site = getSite(request.output);
    if (request.remove) {
        removeStorage(request.output, 1, site)
    } else {
        getStorage(site, function (base) {
            if (base[site][request.output] === undefined) {
                addNewAnime(request.output, 'pusto', site, request.image, request.name, request.time);
            }
        })
    }
});

function setBadge(num) {
    if (num > 0)
        chrome.action.setBadgeText({text: num + ''});
    else
        chrome.action.setBadgeText({text: ''});
}

async function notifyMe(url, title, body, image, createdCallback) {
    const opt = {
        type: 'basic',
        title: title,
        message: body,
        priority: 2,
        requireInteraction: true,
        iconUrl: image
    };
    chrome.notifications.create(opt, function (createdId) {
        let handler = async function (id) {
            if (id === createdId) {
                window.open(url, '_blank');
                let list = await getObjectFromLocalStorage('notificationList');
                for (let key in list) {
                    if (list[key]['url'] === url) {
                        delete list[key];
                        await saveObjectInLocalStorage({'notificationList': list});
                        setBadge(Object.size(list));
                        break;
                    }
                }
                chrome.notifications.clear(id);
                chrome.notifications.onClicked.removeListener(handler);
            }
        };
        chrome.notifications.onClicked.addListener(handler);
        if (typeof createdCallback == "function") createdCallback();
    });

    let list = await getObjectFromLocalStorage('notificationList');
    let id = new Date().getTime();
    if (!list) {
        list = {};
    }
    list[id] = {};
    list[id]['image'] = image;
    list[id]['title'] = title;
    list[id]['body'] = body;
    list[id]['url'] = url;
    setBadge(Object.size(list));
    await saveObjectInLocalStorage({'notificationList': list});
}

async function init() {
    recreateStorage(); // Пересоздаем базу

    await setTimeout(function () {
        checkStorage();
        allsites.forEach(function (e) {
            timeOut(e)
        })
    }, 5000);
    let list = await getObjectFromLocalStorage('notificationList');
    setBadge(Object.size(list))
}

const testNotif = function () {
    body = 'Тестовое уведомление';
    notifyMe('https://a19.agorov.org/tip/tv/2285-dungeon-ni-deai-wo-motomeru-no-wa-machigatteiru-darou-ka-ii.html', 'Тестовое Анимэээ', body, "https://a19.agorov.org/uploads/posts/2019-07/1562792364_1.jpg")
};

function recreateStorage() {
    checker('anistar', 0);
    chrome.storage.sync.get('animeList', function (result) {
        let b = result;
        if (b.animeList !== undefined)
            chrome.storage.local.set(b.animeList);
        chrome.storage.sync.clear()
    });
}

var correctUrlsFunc = function () {
    getStorage('urls', async function (base) {
        base['urls']['anidub'] = 'anidub';
        base['urls']['anilibria'] = 'anilibria';
        base['urls']['animy'] = 'animy';
        base['urls']['animevost'] = 'vost.pw';

        let response = await fetch('https://www.googleapis.com/youtube/v3/channels?id=UC0l-g_Ti9rA-SY4l113PCZA&part=snippet&key=AIzaSyA-dlBUjVQeuc4a6ZN4RkNUYDFddrVLxrA');

        if (response.ok) {
            let data = await response.text();
            let domainList = JSON.parse(JSON.parse(data).items[0].snippet.description);
            base['urls']['anistar'] = new URL('http://' + domainList[Object.keys(domainList)[Object.keys(domainList).length - 1]]).hostname;
        }
        chrome.storage.local.set(base);
        correctUrls = base['urls'];
        // var xhr_animevost = new XMLHttpRequest();
        // xhr_animevost.open('GET', 'https://vk.com/animevostorg');
        // xhr_animevost.send();
        // xhr_animevost.onreadystatechange = function() {
        // 	if (xhr_animevost.readyState == 4) {
        // 		if (xhr_animevost.status == 200) {
        // 			let page = xhr_animevost.responseText;
        // 			let $page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
        // 			let hostname = new URL($page('.line_value a')[1].textContent).hostname;
        // 			base['urls']['animevost'] = hostname;
        // 		}
        // 	}
        // 	chrome.storage.local.set(base);
        // };

    })
};

const updateDomainURL = function (titles, hostname) {
    for (const title in titles) {
        if (title.indexOf(hostname) === -1) {
            titles[title]['image'] = titles[title]['image'].replace(new URL(title).hostname, hostname);
            Object.defineProperty(titles, title.replace(new URL(title).hostname, hostname),
                Object.getOwnPropertyDescriptor(titles, title));
            delete titles[title];
        }
        console.log(title);
    }
    freezeTime[site] = new Date().getTime() + 300000;
};

function correctDomain(site, url) {
    getStorage(site, function (base) {
        let xhr = new XMLHttpRequest();
        switch (site) {
            case 'anistar':
                xhr.open('GET', 'https://www.googleapis.com/youtube/v3/channels?id=UC0l-g_Ti9rA-SY4l113PCZA&part=snippet&key=AIzaSyA-dlBUjVQeuc4a6ZN4RkNUYDFddrVLxrA');
                xhr.send();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            let domainList = JSON.parse(JSON.parse(this.responseText).items[0].snippet.description);
                            let hostname = new URL('http://' + domainList[Object.keys(domainList)[Object.keys(domainList).length - 1]]).hostname;
                            if (hostname === new URL(url).hostname) {
                                freezeTime[site] = new Date().getTime() + 600000;
                                return;
                            }
                            updateDomainURL(base[site], hostname);
                        }
                    }
                    chrome.storage.local.set(base);
                };
                break;
            // case 'animevost':
            //     xhr.open('GET', 'https://vk.com/animevostorg');
            //     xhr.send();
            //     xhr.onreadystatechange = function () {
            //         let $page;
            //         if (xhr.readyState === 4) {
            //             if (xhr.status === 200) {
            //                 const page = xhr.responseText;
            //                 $page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
            //                 const hostname = new URL($page('.group_info_row.info').find('a')[1].textContent).hostname;
            //                 if (hostname === new URL(url).hostname) {
            //                     freezeTime[site] = new Date().getTime() + 600000;
            //                     return;
            //                 }
            //                 updateDomainURL(base[site]);
            //             }
            //         }
            //         chrome.storage.local.set(base);
            //     };
            //     break
        }
    });

}

init();

var timeStep;

function timeOut(site) {
    getStorage(site, function (base) {
        if (Object.size(base[site]) != 0) {
            if ((60000 / Object.size(base[site])) >= duration) {
                timeStep = 60000;
                newDuration = 60000 / Object.size(base[site]);
            } else {
                timeStep = Object.size(base[site]) * duration;
                newDuration = duration;
            }
            setTimeout(function () {
                timeOut(site)
            }, timeStep);
            checker(site, newDuration)
        } else {
            setTimeout(function () {
                timeOut(site)
            }, 300000)
        }
    })
}

function newSystem(time) {
    if (time <= 0)
        return;
    ctime = time - (new Date().getTime() / 1000);
    var n = 20000;
    maxValue = (ctime ^ 0.5) + n * 60;
    console.log("maxValue =" + maxValue);
    ranValue = Math.floor(Math.random() * maxValue);
    console.log("ranValue =" + ranValue);
    //y = ((time^0.5)*500)+n*60
    if (!ranValue)
        return;
    z = time - ranValue;
    console.log("z =" + z);
    newSystem(z)
}
