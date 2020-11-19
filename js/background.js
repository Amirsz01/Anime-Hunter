const duration = 10000;
let allsites = ['anistar','animevost','anilibria','anidub','animy', 'urls'];
let freezeTime = {'anistar': 0, 'animevost': 0, 'anilibria': 0, 'anidub': 0, 'animy': 0};
let correctUrls = {};
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
Object.renameProperty = function (oldName, newName) {
     // Do nothing if the names are the same
     if (oldName == newName) {
         return this;
     }
    // Check for the old property name to avoid a ReferenceError in strict mode.
    if (this.hasOwnProperty(oldName)) {
        this[newName] = this[oldName];
        delete this[oldName];
    }
    return this;
};

var checker = function(site, custDuration){
	let i=0;
	if(site == 'urls')
		return;
	getStorage(site, function(base){
		if (base !== undefined || base !== null){
			var animeList = base[site];
			for (var title in animeList) {
				i++;
				(function(i, title, site) {
						setTimeout(function(){
							parse(title, site); 
						}, (custDuration * i));
					 })(i, title, site);
			}
		} else {
			createStorage()
		}
	})
}

var parse = function(key, site) {
	getStorage(site, function(base){
		if (base[site][key] == undefined || base[site][key] == null || base[site][key]['time'] == 'end' || freezeTime[site] > new Date().getTime()){
			return;
		}
		var xhr = new XMLHttpRequest();
			if(site == 'anidub'){
				api_key = 'https://mycoub.ru/api-grabbing?url=' + key
				xhr.open('GET', api_key, true); 
			}
			else
			{
				xhr.open('GET', key, true); 
			}
			xhr.send();
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) { 
					if (xhr.status == 200) { 
						var page = xhr.responseText;
						switch(site){
							case 'anistar':
								$page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
								$lastEpisode = $page.find('.torrent .info_d1:first')
								$lastEpisode.text().match(/[0-9]+/i) != null ? lastEpisodeNum = parseInt($lastEpisode.text().match(/[0-9]+/i)[0]) : lastEpisodeNum = -1;
								$newTitle = $page.find('.tags').text()
								$newTitle.match(/онгоинги/) || $newTitle.match(/Скоро/) != null || base[site][key]['time'] != null ? $newTitle = true : $newTitle = false;
								time = null
								if(page.match(/var left = parseInt\([0-9]+/g))
								{
									time = parseInt(page.match(/var left = parseInt\([0-9]+/g)[0].match(/[0-9]+/)[0]);
								}
								else
								{
									time = null;
								}
								break;
							case 'animevost':
								$page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
								lastEpisode = page.match(/var data =.*/)[0]
								if(lastEpisode.match(/-/g)){
									$lastEpisode = lastEpisode.match(/-/g).length - 1 + lastEpisode.match(/серия/g).length
								} else {
									if(lastEpisode.match(/серия/g))
									{
										$lastEpisode = lastEpisode.match(/серия/g).length;
									} else {
										$lastEpisode = 'pusto';
									}
								}
								$lastEpisode != null? lastEpisodeNum = parseInt($lastEpisode) : lastEpisodeNum = -1;
								page.match(/id="nexttime"/) || $page.find('.shortstoryFuter').text().match('Онгоинги') || page.match(/miniInfo/) != null ? $newTitle = true : $newTitle = false;
								if(page.match(/id="nexttime"/))
								{
									time = parseInt(page.match(/var left = parseInt\([0-9]+/g)[0].match(/[0-9]+/)[0])
								}
								else
								{
									time = null;
								}
								break;
							case 'anilibria':
								$page = $(page.replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''))
								$lastEpisode = $page.find('.torrentcol1:last').text().split('[')[0].split('-')
								if($lastEpisode[$lastEpisode.length-1])
								{
									$lastEpisode = $lastEpisode[$lastEpisode.length-1].match(/[0-9]+/g)[0]
								} else {
									$lastEpisode = null
								}
								$lastEpisode != null? lastEpisodeNum = parseInt($lastEpisode) : lastEpisodeNum = -1;
								page.match(/В работе/) || page.match(/Не начат/) != null ? $newTitle = true : $newTitle = false;
								time = null;
								break;
							case 'anidub':
								$page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, '').replace(/<iframe.*?<\/iframe>/g,''));
								$range = $page.find('.fright>h1').text().match(/[0-9]+\sиз\s[0-9]+/g)
								if($range)
									$newTitle = $range.filter(function(e, i){
										return e.split(' из ')[0] != e.split(' из ')[1]
									}).length
								if($page.find('.series-tab.active>span')[0] !== undefined)
									$lastEpisode = $page.find('.series-tab.active>span')[0].length
								else
									$lastEpisode = null
								$lastEpisode != null? lastEpisodeNum = parseInt($lastEpisode) : lastEpisodeNum = -1;
								if ($page.find('.fright>h1').text().indexOf('xxx') !== -1 || $page.find('.fright>h1').text().indexOf('ххх') !== -1)
									$newTitle = true
								time = null
								//$('#sel')[0].length
								break;
							case 'animy':
								$page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(href|src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, '').replace(/<iframe.*?<\/iframe>/g,''));
								$lastEpisode = $page.find('#one-panel>ul>li').length;
								$lastEpisode != null? lastEpisodeNum = parseInt($lastEpisode) : lastEpisodeNum = -1;
								time = null
								$newTitle = true;
								break;
						}

						var body = '';
						if ($newTitle){
							if(base[site][key]['epizodes'] == 'pusto'){
								setStorage(key, lastEpisodeNum, site, time);
							} else if(base[site][key]['epizodes'] < lastEpisodeNum){
								setStorage(key, lastEpisodeNum, site, time);
								body = 'Вышла новая ' + lastEpisodeNum + ' серия!'
								notifyMe(key, base[site][key]['name'], body, base[site][key]['image'])
							} else {
								if(base[site][key]['time'] != time)
								{
									setStorage(key, lastEpisodeNum, site, time);
								}
							}
						} else {
							if(base[site][key]['epizodes'] < lastEpisodeNum){
								time = 'end';
								setStorage(key, lastEpisodeNum, site, time);
								body = 'Вышла новая ' + lastEpisodeNum + ' серия!';
								notifyMe(key, base[site][key]['name'], body, base[site][key]['image'])
							}
							//removeStorage(key, 2, site)//Удалить аниме, т.к оно закончилось
						}
					} else if (xhr.status == 502){ 
					} else if (xhr.status == 404){
					} else {
						if(freezeTime[site] < new Date().getTime())
							correctDomain(site,key);
					}
			} 
		}
	})
}
var addNewSite = function(site){
	getStorage(site, function(base){
		base[site] = {}
		chrome.storage.local.set(base);
		if(site == "urls")
			correctUrlsFunc();
	});
}
var getSite = function(url){
	if(url.indexOf(correctUrls['anilibria']) !== -1){
		return 'anilibria'
	} else if(url.indexOf(correctUrls['anidub']) !== -1){
		return 'anidub'
	} else if(url.indexOf(correctUrls['animy']) !== -1){
		return 'animy'
	} else if(url.indexOf(correctUrls['anistar'].match(/[^.]*.[^.]*$/)[0]) !== -1){
		return 'anistar'
	} else if(url.indexOf(correctUrls['animevost'].match(/[^.]*.[^.]*$/)[0]) !== -1){
		return 'animevost'
	} else {
		return 'error'
	}
}

var createStorage = function(callback){
	chrome.storage.local.set({'anistar': {},
                            'animevost': {},
                            'anilibria': {},
                            'anidub': {},
                        	'urls':{}})  
}

var addNewAnime = function(url, num, site, image, name, time){
	getStorage(site, function(base){
		base[site][url] = {}
		base[site][url]['epizodes'] = num;
		base[site][url]['image'] = image;
		base[site][url]['name'] = name;
		base[site][url]['time'] = time;
		chrome.storage.local.set(base);
	});
}

var setStorage = function(url, num, site, time){
	getStorage(site, function(base){
		if(num != null)
			base[site][url]['epizodes'] = num;
		base[site][url]['time'] = time;
		chrome.storage.local.set(base);
	});
}

var getStorage = function(site, callback){
	chrome.storage.local.get(site, function(data){
		callback(data);
	})
}

var checkStorage = function(){
	allsites.forEach(function(e){
		getStorage(e, function(base){
			if ((base[e] == null) || (base[e] == undefined) || (Object.keys(base).length == 0))
			{
				addNewSite(e);
				console.log('Добавлен новый сайт ' + e); 
			}
			else if (e == 'urls') {
				correctUrlsFunc();
			} 
		})			
	})
}
//type 1 - Отписка
//type 2 - Закончилось
var removeStorage = function(url, type, site){
	getStorage(site, function(base) {
		switch(type){
			case 1: {
				break;
			}
			case 2: {
				let body = 'Аниме полностью вышло и мы его удалили!'
				notifyMe(url, base[site][url]['name'], body, base[site][url]['image'])
			break
			}
		}
		if(base[site][url] == undefined || base[site][url] == null)
		{
			let path = new URL(url).pathname;
			for(var key in base[site])
			{
				if(key.indexOf(path) !== -1)
				{
					delete base[site][key];
					break;
				}
			}
		}
		else
		{
			delete base[site][url];
		}
		chrome.storage.local.set(base);
	})
}


var output;
chrome.extension.onMessage.addListener(function(request) {
	site = getSite(request.output)
	if (request.remove){
		removeStorage(request.output, 1, site)
	} else {
		getStorage(site, function(base) {
			if (base[site][request.output] === undefined){
				addNewAnime(request.output, 'pusto', site, request.image, request.name, request.time);
			}
		})
	}
})
function setBadge(num){
	if(num > 0)
		chrome.browserAction.setBadgeText({text: num + ''});
	else
		chrome.browserAction.setBadgeText({text: ''});
}

function notifyMe(url, title, body, image, createdCallback) {
	var opt = {
		type: 'basic',
		title: title,
		message: body,
		priority: 2,
		requireInteraction : true,
		iconUrl: image
	}
	var templates = {};
  	chrome.notifications.create(opt, function(createdId) {
	    var handler = function(id) {
	      if(id == createdId) {
	        window.open(url, '_blank');
	        let list = JSON.parse(localStorage.getItem('notificationList'));
	        for (var key in list) {
	        	if(list[key]['url'] == url){
	        		delete list[key]
	        		localStorage.setItem('notificationList', JSON.stringify(list));
	        		setBadge(Object.size(list))
	        		break;
	        	}
	        }
	        chrome.notifications.clear(id);
	        chrome.notifications.onClicked.removeListener(handler);
	      }
	    };
	    chrome.notifications.onClicked.addListener(handler);
	    if(typeof createdCallback == "function") createdCallback();
  	})
	var list = JSON.parse(localStorage.getItem('notificationList'));
	if(!list)
		list = {};
	id = new Date().getTime();
	list[id] = {};
	list[id]['image'] = image;
	list[id]['title'] = title;
	list[id]['body'] = body;
	list[id]['url'] = url;
	setBadge(Object.size(list))
	localStorage.setItem('notificationList', JSON.stringify(list));
}

function init() {
	recreateStorage(); // Пересоздаем базу
	setTimeout(function(){
		checkStorage();
		allsites.forEach(function(e){
			timeOut(e)
		})
	}, 5000);
	var list = JSON.parse(localStorage.getItem('notificationList'));
	setBadge(Object.size(list))
}
function testNotif(){
	body = 'Тестовое уведомление';
	notifyMe('https://a19.agorov.org/tip/tv/2285-dungeon-ni-deai-wo-motomeru-no-wa-machigatteiru-darou-ka-ii.html', 'Тестовое Анимэээ', body, "https://a19.agorov.org/uploads/posts/2019-07/1562792364_1.jpg")
}
function recreateStorage(){
	chrome.storage.sync.get('animeList', function(result) {
  		b=result;
  		if(b.animeList != undefined)
  			chrome.storage.local.set(b.animeList)
  		chrome.storage.sync.clear()
	});
}
var correctUrlsFunc = function(){
	getStorage('urls', function(base){
		base['urls']['anidub'] = 'anidub';
		base['urls']['anilibria'] = 'anilibria';
		base['urls']['animy'] = 'animy';
		var xhr_anistar = new XMLHttpRequest();
		xhr_anistar.open('GET', 'https://www.googleapis.com/youtube/v3/channels?id=UC0l-g_Ti9rA-SY4l113PCZA&part=snippet&key=AIzaSyA-dlBUjVQeuc4a6ZN4RkNUYDFddrVLxrA'); 
		xhr_anistar.send();
		xhr_anistar.onreadystatechange = function() {
			if (xhr_anistar.readyState == 4) { 
				if (xhr_anistar.status == 200) { 
					let domainList = JSON.parse(JSON.parse(this.responseText).items[0].snippet.description);
					let hostname = new URL('http://' + domainList[Object.keys(domainList)[Object.keys(domainList).length-1]]).hostname;
					base['urls']['anistar'] = hostname;
				}
			}
			chrome.storage.local.set(base);
		}
		var xhr_animevost = new XMLHttpRequest();	
		xhr_animevost.open('GET', 'https://vk.com/animevostorg'); 
		xhr_animevost.send();
		xhr_animevost.onreadystatechange = function() {
			if (xhr_animevost.readyState == 4) { 
				if (xhr_animevost.status == 200) { 
					let page = xhr_animevost.responseText;
					let $page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
					let hostname = new URL($page.find('.line_value a')[1].textContent).hostname;
					base['urls']['animevost'] = hostname;
				}
			}
			chrome.storage.local.set(base);
		}
		correctUrls = base['urls'];
	})
}
function correctDomain(site,url){
	getStorage(site, function(base){
		switch(site)
		{
			case 'anistar': 
				var xhr = new XMLHttpRequest();
				xhr.open('GET', 'https://www.googleapis.com/youtube/v3/channels?id=UC0l-g_Ti9rA-SY4l113PCZA&part=snippet&key=AIzaSyA-dlBUjVQeuc4a6ZN4RkNUYDFddrVLxrA');
				xhr.send();
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4) { 
						if (xhr.status == 200) {
							let domainList = JSON.parse(JSON.parse(this.responseText).items[0].snippet.description);
							let hostname = new URL('http://' + domainList[Object.keys(domainList)[Object.keys(domainList).length-1]]).hostname;
							if(hostname == new URL(url).hostname) {
								freezeTime[site] = new Date().getTime() + 600000;
								return;
							}
							for (var title in base[site]) 
							{
								if(title.indexOf(hostname) == -1)
								{
									base[site][title]['image'] = base[site][title]['image'].replace(new URL(title).hostname, hostname);
									Object.defineProperty(base[site], title.replace(new URL(title).hostname, hostname),
					        		Object.getOwnPropertyDescriptor(base[site], title));
					    			delete base[site][title];
								}
							console.log(title);
							}
							freezeTime[site] = new Date().getTime() + 300000;
						}
					}
					chrome.storage.local.set(base);
				}
				break
			case 'animevost': 
				var xhr = new XMLHttpRequest();	
				xhr.open('GET', 'https://vk.com/animevostorg'); 
				xhr.send();
				xhr.onreadystatechange = function() {
					if (xhr.readyState == 4) { 
						if (xhr.status == 200) { 
							var page = xhr.responseText;
							$page = $(page.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/ig, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig, '').replace(/(src)=("|')[^=("|')]*(?:(?!("|'))<[^"]*)*("|')/ig, ''));
							var hostname = new URL($page.find('.group_info_row.info').find('a')[1].textContent).hostname;
							if(hostname == new URL(url).hostname) {
								freezeTime[site] = new Date().getTime() + 600000;
								return;
							}
							for (var title in base[site]) 
							{
								if(title.indexOf(hostname) == -1)
								{
									base[site][title]['image'] = base[site][title]['image'].replace(new URL(title).hostname, hostname);
									Object.defineProperty(base[site], title.replace(new URL(title).hostname, hostname),
					        		Object.getOwnPropertyDescriptor(base[site], title));
					    			delete base[site][title];
								}
							console.log(title);
							}
							freezeTime[site] = new Date().getTime() + 300000;
						}
					}
					chrome.storage.local.set(base);
				}
				break
		}
	});

}
init();
var timeStep
function timeOut(site){
	getStorage(site, function(base){
		if(Object.size(base[site]) != 0)
		{
			if((60000 / Object.size(base[site])) >= duration)
			{
				timeStep = 60000;
				newDuration = 60000 / Object.size(base[site]);
			}
			else
			{
				timeStep = Object.size(base[site]) * duration
				newDuration = duration;
			}
			setTimeout(function(){
				timeOut(site)
			}, timeStep)
			checker(site, newDuration)
		}
		else
		{
			setTimeout(function(){
				timeOut(site)
			}, 300000)
		}
	})
}

function newSystem(time)
{
	if(time<=0)
		return
	ctime = time - (new Date().getTime()/1000)
	var n = 20000;
	maxValue = (ctime^0.5)+n*60;
	console.log("maxValue ="+maxValue)
	ranValue = Math.floor(Math.random() * maxValue);
	console.log("ranValue ="+ranValue)
	//y = ((time^0.5)*500)+n*60
	if(!ranValue)
		return
	z=time-ranValue
	console.log("z ="+z)
	newSystem(z)
}