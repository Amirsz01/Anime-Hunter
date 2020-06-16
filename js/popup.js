var templates = {};
var tabs = {};
var arraySubj = new Array();

var getSortType = function(){
 let res = localStorage.getItem('sortType');
 if(res == null)
  {
    localStorage.setItem('sortType','time');
    $('.sort-type-time').addClass('active');
    return 'time';
  }
  else
  {
     $(`.sort-type-${res}`).addClass('active');
    return res;
  }
}

var sortType = getSortType();
setBadge();
Array.prototype.sortBy = function(type){
  if(type == 'time')
  {
    this.sort(function(a,b){
      if(a.time == null)
        return 1;
      else if(b.time == null)
        return -1;
      if(a.time>b.time)
        return 1;
      else if(a.time<b.time)
        return -1;
    })
  }
  else if(type == 'name')
  {
    this.sort(function(a,b){
      if(a.name.trim()>b.name.trim())
        return 1;
      else if(a.name.trim()<b.name.trim())
        return -1;
    })
  }
  $subContent.find('.item').remove()
  for (var j = this.length-1; j >= 0; j--) {
    if ($subContent.find('.simplebar-content').length) {
        $subContent.find('.simplebar-content').prepend(this[j].template);
    } else {
        $subContent.prepend(this[j].template);
    }
    getNextTime(this[j].timer_id,this[j].time);
  }
}
tabs.switcher = function (tabName) {
    var tabIndex = $('header [data-tab-name]').index(`header [data-tab-name="${tabName}"]`);
    var mainWidth = $('.main-container').width();

    $('[data-role="tab"]').removeClass('active');
    $(`main [data-role="tab"]`).find('.simplebar-track:last').css('transform', '').css('opacity', '');

    $(`[data-tab-name="${tabName}"]`).addClass('active');
    $('.main-container').css('transform', `translate3d(${ mainWidth * tabIndex}px, 0, 0`);
    $('.header__tab').css('transform', `translate3d(${tabIndex == 0 ? '-' + '0' : '100'}%, 0, 0`);
    $(`main [data-role="tab"]:not([data-tab-name="${tabName}"])`).find('.simplebar-track:last').css('transform', `translate3d(${tabIndex == 0 ? '-' + mainWidth : mainWidth}px, 0, 0`).css('opacity', '0');
};

tabs.switcherEvent = (function() {
    $(document).on('click', 'header [data-role="tab"]', function () {
        if (!$(this).hasClass('active')) {
            tabs.switcher($(this).data('tab-name'));
            if($(this).data('tab-name') == 'subs'){
              $('.filter').addClass('visible');
              $('.notif-footer').removeClass('visible');
            }
            else
            {
              $('.filter').removeClass('visible');
              $('.notif-footer').addClass('visible');
            }
        }
    });
})();

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var notifList = function(){
  notificationList = JSON.parse(localStorage.getItem('notificationList'));
  return notificationList;
}
var notificationList = notifList();

if(Object.size(notificationList) != 0) {
    tabs.switcher('notification')
    $('.filter').removeClass('visible');
    $('.notif-footer').addClass('visible');
}
else
{
    tabs.switcher('subs')
    $('.filter').addClass('visible');
    $('.notif-footer').removeClass('visible');
    $('.small-button').addClass('disabled');
}

var empty = true;
var  $notificationContent = $('.main-content[data-tab-name="notification"]');
for (var id in notificationList) {
    empty = false;
    templates.item = `
        <div class="item" data-id="${id}">
            <div class="item-info">
                <div class="item-info__poster" style="background-image: url('${notificationList[id]['image']}')"></div>
                <div class="item-info-text">
                    <span class="item-info-text__title">
                        ${notificationList[id]['title']}
                    </span>
                    <span class="item-info-text__time">
                        ${notificationList[id]['body']}
                    </span>
                </div>
            </div>
            <div class="item-control">
                <a class="item-control__link" href="${notificationList[id]['url']}" target="_blank">
                    <span class="text">Перейти к просмотру<i class="icon-angel-rigrt"></i></span>
                </a>
                <div class="item-control__close">
                    <span class="text"><i class="icon-times"></i></span>
                </div>
            </div>
        </div>
    `;
    if ($notificationContent.find('.simplebar-content').length) {
        $notificationContent.find('.simplebar-content').prepend(templates.item);
    } else {
        $notificationContent.prepend(templates.item);
    }
}
new SimpleBar($notificationContent.get(0), {autoHide: false});

if(empty) {
    templates.item = `
        <div class="empty">
            <span class="empty-text empty-text__notification">
                Новых уведомлений нет!
            </span>
        </div>
    `;
    if ($('.main [data-tab-name="notification"]').find('.simplebar-content')) {
        $('.main [data-tab-name="notification"]').find('.simplebar-content').prepend(templates.item);
    } else {
        $('.main [data-tab-name="notification"]').prepend(templates.item);
    }
}

function setBadge(num = 0){
  if(num)
  {
    chrome.browserAction.setBadgeText({text: num + ''});
  }
  else
  {
    chrome.browserAction.setBadgeText({text: ''});
  }
}
var emptyFunc = function(b = -1){
  if(b != -1)
  {
    if ($.isEmptyObject(b.anilibria) && $.isEmptyObject(b.anistar) && $.isEmptyObject(b.animevost) && $.isEmptyObject(b.anidub))
    {
        templates.item = `
            <div class="empty">
                <span class="empty-text empty-text__subs">
                    У вас нет подписок!
                </span>
            </div>
        `;
        if ($('.main [data-tab-name="subs"]').find('.simplebar-content').length) {
          $('.main [data-tab-name="subs"]').prepend(templates.item);
        } else {
          $('.main [data-tab-name="subs"]').prepend(templates.item);
        }
    }
  } else {
    notificationList = notifList();
    if($.isEmptyObject(notificationList)){
        templates.item = `
            <div class="empty">
                <span class="empty-text empty-text__notification">
                    Новых уведомлений нет!
                </span>
            </div>
        `;
        notificationList = 0;
        $('.small-button').addClass('disabled');
        if ($('.main [data-tab-name="notification"]').find('.simplebar-content')) {
            $('.main [data-tab-name="notification"]').find('.simplebar-content').prepend(templates.item);
        } else {
            $('.main [data-tab-name="notification"]').prepend(templates.item);
        }
    }
  }
  //setBadge(Object.size(notificationList))
}
var addToArray = function(id, template, name, time)
{
  arraySubj[id] = {};
  arraySubj[id]['template'] = template;
  arraySubj[id]['name'] = name;
  arraySubj[id]['time'] = time;
  arraySubj[id]['timer_id'] = id;
}

var getStringTime = function(num, type)
{
if(num > 10 && num < 20)
    {
      switch(type)
      {
      case 'd':
        return " дней";
      case 'h':
        return " часов";
      case 'm':
        return " минут";
      }
    }
  switch(num % 10)
  {
    case 1:
      switch(type)
      {
      case 'd':
        return " день";
      case 'h':
        return " час";
      case 'm':
        return " минута";
      }
    case 2:
    case 3:
    case 4:
      switch(type)
      {
      case 'd':
        return " дня";
      case 'h':
        return " часа";
      case 'm':
        return " минуты";
      }
    default:
      switch(type)
      {
      case 'd':
        return " дней";
      case 'h':
        return " часов";
      case 'm':
        return " минут";
      }
      break;
  }
}
var getNextTime = function(id,time){
  if(time == "end")
  {
    document.getElementById('nextTime'+id).innerText = `Полностью вышло`;
    return;
  }
  if(time == null)
  {
    document.getElementById('nextTime'+id).innerText = `Без таймера`;
    return;
  }
  let left = parseInt(time - (new Date().getTime()/1000))
  let timeRender = function(left, id){
    left = left - 1;
    if (left > 0){
      minutes = left / 60 | 0,
      hours = minutes / 60 | 0,
      days = hours / 24 | 0,
      hours = hours % 24;
      seconds = left % 60;
      minutes %= 60;
      if(document.getElementById('nextTime'+id))
      {
        wordDay = getStringTime(days, 'd')
        wordHours = getStringTime(hours, 'h')
        wordMinutes = getStringTime(minutes, 'm')
        document.getElementById('nextTime'+id).innerText = `${days ? days + wordDay + ' ' : ''}${hours ? hours + wordHours + ' ' : ''}${minutes ? minutes + wordMinutes : ''}`
        setTimeout(function(){timeRender(left,id)}, 1000); 
      }
    }
  }
  timeRender(left, id);
}
var $subContent = $('.main-content[data-tab-name="subs"]');
chrome.storage.local.get(null, function(result) {
    let i = 0;
    b = result;
    if (!$.isEmptyObject(b.anilibria) || !$.isEmptyObject(b.anistar) || !$.isEmptyObject(b.animevost) || !$.isEmptyObject(b.anidub)) {
      empty = true;
      var animeList = b;
      for (var site in animeList) {
        if(site == 'urls')
          continue;
        for (var animeUrl in animeList[site]){
          let time = animeList[site][animeUrl]['time'];
            templates.item = `
            <div class="item"  data-site="${site}" data-id="${i}" data-time="${time}">
                <div class="item-info">
                    <div class="item-info__poster" style="background-image: url('${animeList[site][animeUrl]['image']}')"></div>
                    <div class="item-info-text">
                        <span class="item-info-text__title">
                            ${animeList[site][animeUrl]['name']}
                        </span>
                        <span class="item-info-text__time">
                        <i class="icon-clock"></i><span id="nextTime${i++}"></span>
                        </span>
                    </div>
                </div>
                <div class="item-control">
                    <a class="item-control__link" href="${animeUrl}" target="_blank">
                        <span class="text">Перейти к просмотру<i class="icon-angel-rigrt"></i></span>
                    </a>
                    <div class="item-control__close">
                        <span class="text"><i class="icon-times"></i></span>
                    </div>
                </div>
            </div>
            `;
            addToArray(i-1,templates.item,animeList[site][animeUrl]['name'],time)
        }
      }
      arraySubj.sortBy(sortType);
    } else {
     empty = false;
    }
    if(!empty) {
        templates.item = `
           <div class="empty">
                <span class="empty-text empty-text__subs">
                    У вас нет подписок!
                </span>
            </div>
        `;
        if ($('.main [data-tab-name="subs"]').find('.simplebar-content').length) {
            $('.main [data-tab-name="subs"]').find('.simplebar-content').prepend(templates.item);
        } else {
            $('.main [data-tab-name="subs"]').prepend(templates.item);
        }
    }
    $('[data-tab-name="subs"] .item-control__close').click(function() {
      chrome.runtime.sendMessage({output: $(this).closest('.item').find('a').attr('href'), remove: 1});
      $(this).closest('.item').remove();
      delete b[$(this).closest('.item').data('site')][$(this).closest('.item').find('a').attr('href')];
      arraySubj = arraySubj.filter(item => item.timer_id != $(this).closest('.item').data('id'));
      emptyFunc(b)
    });
    new SimpleBar($subContent.get(0), {autoHide: false});
});

$('[data-tab-name="notification"] .item').click(function() {
  urlRed = $(this).find('a').attr('href')
  window.open(urlRed);
  delete notificationList[$(this).data('id')];
  $(this).remove();
  localStorage.setItem('notificationList', JSON.stringify(notificationList));
  emptyFunc();
})


$('[data-tab-name="notification"] .item-control__close').click(function() {
  delete notificationList[$(this).closest('.item').data('id')]
  $(this).closest('.item').remove();
  localStorage.setItem('notificationList', JSON.stringify(notificationList))
  emptyFunc()
})

$('.sort-type-time').click(function(){
  if(sortType == 'time')
  {
    console.log("Данные уже отсортированны по данному типу");
    return;
  }
  $('.sort.active').removeClass('active');
  $(this).addClass('active');
  sortType = 'time';
  localStorage.setItem('sortType','time');
  arraySubj.sortBy('time');
})

$('.sort-type-name').click(function(){
  if(sortType == 'name')
  {
    console.log("Данные уже отсортированны по данному типу");
    return;
  }
  $('.sort.active').removeClass('active');
  $(this).addClass('active');
  sortType = 'name';
  localStorage.setItem('sortType','name');
  arraySubj.sortBy('name');
})

$('.small-button').click(function(){
  $('[data-tab-name="notification"] .item').remove();
  notificationList = {};
  localStorage.setItem('notificationList', JSON.stringify(notificationList));
  $(this).addClass('disabled');
  emptyFunc();
})

setTimeout(()=>{
  $('body').append(` 
    <style> 
      .header__tab
      {
        transition: transform 0.4s cubic-bezier(0.51, 0.09, 0, 0.99);
      }
      .main-container
      {
        transition: transform 0.4s cubic-bezier(0.58, -0.03, 0, 1); 
      }
    </style> 
  `)
},50)