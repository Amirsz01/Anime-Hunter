import {getObjectFromLocalStorage, saveObjectInLocalStorage} from "./utils/utils.js";
import {anistarHandler} from "./handlers/anistar.js";
import {animevostHandler} from "./handlers/animevost.js";
import {animyHandler} from "./handlers/animy.js";

const duration = 10000;

let allsites = ['anistar', 'animevost', 'anilibria', 'anidub', 'animy', 'urls'];

let freezeTime = {'anistar': 0, 'animevost': 0, 'anilibria': 0, 'anidub': 0, 'animy': 0};

const handlers = {
    anistar: anistarHandler,
    animevost: animevostHandler,
    animy: animyHandler
}

let correctUrls = {};

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

const getStorage = function getStorage(site, callback) {
    chrome.storage.local.get(site, function (data) {
        callback(data);
    })
};

const setStorage = function setStorage(url, num, site, time) {
    getStorage(site, function (base) {
        if (num != null)
            base[site][url]['epizodes'] = num;
        base[site][url]['time'] = time;
        chrome.storage.local.set(base);
    });
};

const parse = function parse(key, site) {
    getStorage(site, async function (base) {
        if (base[site][key] === undefined || base[site][key] == null || base[site][key]['time'] === 'end' || freezeTime[site] > new Date().getTime()) {
            return;
        }
        if (site === 'anidub') {
            key = 'https://mycoub.ru/api-grabbing?url=' + key;
        }

        fetch(key)
            .then(async response => {
                if (response.ok) {
                    let page;
                    if (site === 'anistar') {
                        page = new TextDecoder('windows-1251').decode(await response.arrayBuffer()).toString();
                    } else {
                        page = await response.text();
                    }
                    let handler = handlers[site];

                    let {lastEpisodeNum, newTitle, time} = handler(page);


                    let messageBody;
                    if (newTitle) {
                        if (base[site][key]['epizodes'] === 'pusto') {
                            setStorage(key, lastEpisodeNum, site, time);
                        } else if (base[site][key]['epizodes'] < lastEpisodeNum) {
                            setStorage(key, lastEpisodeNum, site, time);
                            messageBody = 'Вышла новая ' + lastEpisodeNum + ' серия!';
                            await notifyMe(key, base[site][key]['name'], messageBody, base[site][key]['image'])
                        } else {
                            if (base[site][key]['time'] !== time) {
                                setStorage(key, lastEpisodeNum, site, time);
                            }
                        }
                    } else {
                        if (base[site][key]['epizodes'] < lastEpisodeNum) {
                            time = 'end';
                            setStorage(key, lastEpisodeNum, site, time);
                            messageBody = 'Вышла новая ' + lastEpisodeNum + ' серия!';
                            await notifyMe(key, base[site][key]['name'], messageBody, base[site][key]['image'])
                        }
                    }
                } else {
                    if (freezeTime[site] < new Date().getTime())
                        correctDomain(site, key);
                }
            })
            .catch(() => {
                if (freezeTime[site] < new Date().getTime())
                    correctDomain(site, key);
            });
    })
};

const createStorage = function createStorage() {
    chrome.storage.local.set({
        'anistar': {},
        'animevost': {},
        'anilibria': {},
        'anidub': {},
        'urls': {}
    })
};

const checker = function checker(site, castDuration) {
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


const correctUrlsFunc = function correctUrlsFunc() {
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
const addNewSite = function addNewSite(site) {
    getStorage(site, function (base) {
        base[site] = {};
        chrome.storage.local.set(base);
        if (site === "urls")
            correctUrlsFunc();
    });
};
const getSite = function getSite(url) {
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


const addNewAnime = function addNewAnime(url, num, site, image, name, time) {
    getStorage(site, function (base) {
        base[site][url] = {};
        base[site][url]['epizodes'] = num;
        base[site][url]['image'] = image;
        base[site][url]['name'] = name;
        base[site][url]['time'] = time;
        chrome.storage.local.set(base);
    });
};


const checkStorage = function checkStorage() {
    allsites.forEach(function (e) {
        getStorage(e, function (base) {
            if ((base[e] == null) || (base[e] === undefined) || (Object.keys(base).length === 0)) {
                addNewSite(e);
                console.log('Добавлен новый сайт ' + e);
            } else if (e === 'urls') {
                correctUrlsFunc();
            }
        })
    })
};
//type 1 - Отписка
//type 2 - Закончилось
const removeStorage = function removeStorage(url, type, site) {
    getStorage(site, async function (base) {
        switch (type) {
            case 1: {
                break;
            }
            case 2: {
                let body = 'Аниме полностью вышло и мы его удалили!';
                await notifyMe(url, base[site][url]['name'], body, base[site][url]['image']);
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
        await chrome.storage.local.set(base);
    })
};


let output;
chrome.runtime.onMessage.addListener(function (request) {
    if (request.remove) {
        removeStorage(request.output, 1, request.site)
    } else {
        let site = getSite(request.output);

        getStorage(site, function (base) {
            if (base[site][request.output] === undefined) {
                addNewAnime(request.output, 'pusto', site, request.image, request.name, request.time);
            }
        })
    }
});

async function setBadge(num) {
    if (num > 0)
        await chrome.action.setBadgeText({text: num + ''});
    else
        await chrome.action.setBadgeText({text: ''});
}

async function notifyMe(url, title, body, image, createdCallback) {
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
    const opt = {
        type: 'basic',
        title: title,
        message: body,
        priority: 2,
        requireInteraction: true,
        iconUrl: image
    };

    chrome.notifications.create('', opt);

    await saveObjectInLocalStorage({'notificationList': list});
    await setBadge(Object.size(list));

    typeof createdCallback == "function" ? createdCallback() : null;
}

chrome.notifications.onClosed.addListener(async function (notificationId, byUser) {
    if (notificationId) {
        // let list = await getObjectFromLocalStorage('notificationList');
        // for (let key in list) {
        //     if (list[key]['url'] === url) {
        //         delete list[key];
        //         await saveObjectInLocalStorage({'notificationList': list});
        //         await setBadge(Object.size(list));
        //         break;
        //     }
        // }
        chrome.notifications.clear(notificationId);
    }
});

export async function init() {
    recreateStorage(); // Пересоздаем базу

    await setTimeout(function () {
        checkStorage();
        allsites.forEach(function (e) {
            timeOut(e)
        })
    }, 5000);
    let list = await getObjectFromLocalStorage('notificationList');
    await setBadge(Object.size(list))
}

const testNotif = function testNotif() {
    body = 'Тестовое уведомление';
    notifyMe(
        'https://a19.agorov.org/tip/tv/2285-dungeon-ni-deai-wo-motomeru-no-wa-machigatteiru-darou-ka-ii.html',
        'Тестовое Анимэээ',
        body,
        "https://v2.vost.pw/uploads/posts/2019-07/1562792364_1.jpg")
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


const updateDomainURL = function updateDomainURL(titles, hostname) {
    for (const title in titles) {
        if (title.indexOf(hostname) === -1) {
            titles[title]['image'] = titles[title]['image'].replace(new URL(title).hostname, hostname);
            Object.defineProperty(titles, title.replace(new URL(title).hostname, hostname),
                Object.getOwnPropertyDescriptor(titles, title));
            delete titles[title];
        }
    }
};

function correctDomain(site, url) {
    getStorage(null, async function (base) {
        switch (site) {
            case 'anistar':
                let response = await fetch('https://www.googleapis.com/youtube/v3/channels?id=UC0l-g_Ti9rA-SY4l113PCZA&part=snippet&key=AIzaSyA-dlBUjVQeuc4a6ZN4RkNUYDFddrVLxrA');
                if (response.ok) {
                    let data = await response.text();
                    let domainList = JSON.parse(JSON.parse(data).items[0].snippet.description);
                    base['urls']['anistar'] = new URL('http://' + domainList[Object.keys(domainList)[Object.keys(domainList).length - 1]]).hostname;
                    if (base['urls']['anistar'] === new URL(url).hostname) {
                        freezeTime[site] = new Date().getTime() + 600000;
                        return;
                    }
                    updateDomainURL(base[site], base['urls']['anistar']);
                }
                chrome.storage.local.set(base);
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


let timeStep;

function timeOut(site) {
    getStorage(site, function (base) {
        let newDuration;
        if (Object.size(base[site]) !== 0) {
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