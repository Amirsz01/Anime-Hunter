const getStorage = function (site, callback) {
    chrome.storage.local.get(site, function (data) {
		callback(data);
	})
};

let site;
let correctUrls = {};

function siteProject() {
	if (document.URL.indexOf(correctUrls['anistar']) !== -1 || document.URL.indexOf("anistar.org") !== -1 || document.URL.indexOf("online-star.org") !== -1) {
		return 'anistar';
    } else if (document.URL.indexOf(correctUrls['animevost']) !== -1 || document.URL.indexOf("animevost.org") !== -1 || document.URL.indexOf("agorov.org") !== -1 || document.URL.indexOf("vost.pw") !== -1) {
		return 'animevost';
	} else if (document.URL.indexOf(correctUrls['anilibria']) !== -1) {
		return 'anilibria';
	} else if (document.URL.indexOf(correctUrls['animy']) !== -1) {
		return 'animy';
	} else if (document.URL.indexOf(correctUrls['anidub']) !== -1) {
		return 'anidub';
	}
}

chrome.storage.local.get('urls', function (data) {
	correctUrls = data['urls'];
	site = siteProject();
	switch (site) {
		case 'anistar':
			interface.subscribe = `<div class="anime-checker__button-anistar anime-checker__button-subscribe anime-checker__button-anistar-subscribe">Подписаться</div>`;
			interface.unsubscribe = `<div class="anime-checker__button-anistar anime-checker__button-unsubscribe anime-checker__button-anistar-unsubscribe">Отписаться</div>`;
            break;
		case 'animevost':
			interface.subscribe = `<div class="anime-checker__button-animevost anime-checker__button-subscribe anime-checker__button-animevost-subscribe">Подписаться</div>`;
			interface.unsubscribe = `<div class="anime-checker__button-animevost anime-checker__button-unsubscribe anime-checker__button-animevost-unsubscribe">Отписаться</div>`;
            break;
		case 'anilibria':
			interface.subscribe = `<div class="anime-checker__button-anilibria anime-checker__button-subscribe anime-checker__button-anilibria-subscribe">Подписаться</div>`;
			interface.unsubscribe = `<div class="anime-checker__button-anilibria anime-checker__button-unsubscribe anime-checker__button-anilibria-unsubscribe">Отписаться</div>`;
            break;
		case 'anidub':
			interface.subscribe = `<div class="anime-checker__button-anidub anime-checker__button-subscribe anime-checker__button-anidub-subscribe">Подписаться</div>`;
			interface.unsubscribe = `<div class="anime-checker__button-anidub anime-checker__button-unsubscribe anime-checker__button-anidub-unsubscribe">Отписаться</div>`;
            break;
		case 'animy':
			interface.subscribe = `<div class="anime-checker__button-animy anime-checker__button-subscribe anime-checker__button-animy-subscribe">Подписаться</div>`;
			interface.unsubscribe = `<div class="anime-checker__button-animy anime-checker__button-unsubscribe anime-checker__button-animy-unsubscribe">Отписаться</div>`;
			break
	}
	window.addEventListener('DOMContentLoaded', function (event) {
		switch (site) {
			case 'anistar':
				if ($('.bg-white-main .video_as').length) {
					init();
				}
				break;
			case 'animevost':
				if ($('.shortstoryFuter').length == 1) {
					init();
				}
				break;
			case 'anilibria':
				if ($('.download-torrent').length) {
					init();
				}
				break;
			case 'anidub':
				if ($('.series-tab').length) {
					init();
				}
				break;
			case 'animy':
				if ($('#one-panel>ul>li').length) {
					init();
				}
				break
		}
	})
});


let interface = {};
let tmpURL = new URL(document.URL);
let titleUrl = tmpURL.origin + tmpURL.pathname;

$(document).on('click', '.anime-checker__button-subscribe', async function () {
    let titleTime;
    let titleImage;
    let titleName;
	switch (site) {
		case 'animevost':
            titleName = $('.shortstoryHead').text().replace(/\n/g, '').split('[')[0].replace(/ $/, '');
            titleImage = self.origin + $('.shortstoryContent .imgRadius').attr('src');
			if ($('#dle-content').text().match(/var left = parseInt\([0-9]+/g)) {
                titleTime = parseInt($('#dle-content').text().match(/var left = parseInt\([0-9]+/g)[0].match(/[0-9]+/)[0]);
			} else {
                titleTime = null;
			}
			break;
		case 'anistar':
            titleName = $('.news_header h1').text().replace(/ $/, '');
            titleImage = self.origin + $('.news_avatar .main-img').attr('src');
			if ($('.news_avatar').text().match(/var left = parseInt\([0-9]+/g)) {
                titleTime = parseInt($('#dle-content').text().match(/var left = parseInt\([0-9]+/g)[0].match(/[0-9]+/)[0]);
			} else {
                titleTime = null;
			}
			break;
		case 'anilibria':
            titleName = $('.release-title').text();
            titleImage = $('.detail_torrent_pic').attr('src');
            titleTime = null;
			break;
		case 'anidub':
            titleName = $('.fright>h1').text().replace(/ \[[0-9 а-я]+\]/, "");
            titleImage = $('.fposter').children()[0].src;
            titleTime = null;
			break;
		case 'animy':
            titleName = $('.name').text();
            titleImage = $('.imgr')[0].src;
            titleTime = null;
			if ($('.season-btn').length) {
				let tmpUrl = new URL($('.season-btn')[$('.season-btn').length - 1].href);
				titleUrl = tmpUrl.origin + tmpUrl.pathname + tmpUrl.search;
			}
			break;
	}
	await chrome.runtime.sendMessage({
		output: titleUrl,
		image: titleImage,
		name: titleName,
		remove: 0,
		time: titleTime
	});
	setTimeout(init, 200);
});

$(document).on('click', '.anime-checker__button-unsubscribe', async function () {
	await chrome.runtime.sendMessage({output: titleUrl, remove: 1});
	setTimeout(init, 200);
});


function init() {
	getStorage(site, function (base) {
        var baseUrl;
		switch (site) {
			case 'anistar':
				if ($('.tags').text().match(/Скоро/) || $('.tags').text().match(/онгоинги/) != null || $('.news_avatar script').text().match(/var left = parseInt\([-0-9]*/)[0].match(/[-0-9]+/g)[0] > 0) {
					var urlPathname = new URL(document.URL).pathname;
					let status = false;
					for (key in base.anistar) {
						if (key.indexOf(urlPathname) !== -1) {
							status = true;
							break;
						}
					}
					$('.anime-checker__button-anistar').remove();
					if (!status) {
						$('.bg-white-main .news_avatar').append(interface.subscribe)
					} else {
						$('.bg-white-main .news_avatar').append(interface.unsubscribe)
					}
				}
				break;
			case 'animevost':
				if ($('#nexttime').length || $('.miniInfo').length != 0 || $('.shortstoryFuter').text().match('Онгоинги') != null) {
					var urlPathname = new URL(document.URL).pathname;
					let status = false;
					for (key in base.animevost) {
						if (key.indexOf(urlPathname) !== -1) {
							status = true;
							break;
						}
					}
					$('.anime-checker__button-animevost').remove();
					if (!status) {
						$('.imgRadius').after(interface.subscribe)
					} else {
						$('.imgRadius').after(interface.unsubscribe)
					}
				}
				break;
			case 'anilibria':
				if ($('.detail_torrent_info').text().match(/В работе/) || $('.detail_torrent_info').text().match(/Не начат/) != null) {
					baseUrl = base.anilibria[document.URL];
					$('.anime-checker__button-anilibria').remove();
					if (baseUrl == null || baseUrl == undefined) {
						$('.detail_torrent_side .detail_pic_corner').after(interface.subscribe)
					} else {
						$('.detail_torrent_side .detail_pic_corner').after(interface.unsubscribe)
					}
				}
				break;
			case 'anidub':
                $range = $('.fright>h1').text().match(/[0-9]+\sиз\s[0-9]+/g);
				if ($range)
					$newTitle = $range.filter(function (e, i) {
						return e.split(' из ')[0] != e.split(' из ')[1]
					}).length;
				if ($newTitle || $('.fright>h1').text().indexOf('xxx') !== -1 || $('.fright>h1').text().indexOf('ххх') !== -1) {
					baseUrl = base.anidub[document.URL];
					$('.anime-checker__button-anidub').remove();
					if (baseUrl == null || baseUrl == undefined) {
						$('.fposter').after(interface.subscribe)
					} else {
						$('.fposter').after(interface.unsubscribe)
					}
				}
				break;
			case 'animy':
				if ($($('.li-value')[1].children).text() != 'вышел' && $($('.li-value')[1].children).text() != null) {
					let status = false;
					var urlPathname = new URL(document.URL).pathname;
					for (key in base.animy) {
						if (key.indexOf(urlPathname) !== -1) {
							status = true;
							break;
						}
					}
					$('.anime-checker__button-animy').remove();
					if (!status) {
						$('.btn.down-button').after(interface.subscribe)
					} else {
						$('.btn.down-button').after(interface.unsubscribe)
					}
				}
				break;
		}
	})
}
