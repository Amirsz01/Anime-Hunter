import React from 'react'

const getNextTime = function(time){
    if(time === "end")
    {
        return `Полностью вышло`;
    }
    if(time === null)
    {
        return `Без таймера`;
    }
    return timeRender(parseInt(time - ((new Date().getTime())/1000)));
}

const timeRender = function(left){
    left = left - 1;
    if (left > 0) {
        let minutes = left / 60 | 0,
            hours = minutes / 60 | 0,
            days = hours / 24 | 0;
        hours = hours % 24;
        minutes %= 60;
        let wordDay = getStringTime(days, 'd'),
            wordHours = getStringTime(hours, 'h'),
            wordMinutes = getStringTime(minutes, 'm');
        return `${days ? days + wordDay + ' ' : ''}${hours ? hours + wordHours + ' ' : ''}${minutes ? minutes + wordMinutes : ''}`;
    }
    return 'Скоро выйдет...'
}
const getStringTime = function(num, type)
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
            default:
                break;
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
                default:
                    break;
            }
            break;
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
                default:
                    break;
            }
            break;
        default:
            switch(type)
            {
                case 'd':
                    return " дней";
                case 'h':
                    return " часов";
                case 'm':
                    return " минут";
                default:
                    break;
            }
            break;
    }
}
export default function SubsItem({site,id, item, onRemove = ()=>{}}) {
    return(
        <div className="item" data-site={site} data-id={id} data-time={50}>
            <div className="item-info">
                <div className="item-info__poster" style={{backgroundImage: `url(${item.image})`}} />
                <div className="item-info-text">
                        <span className="item-info-text__title">
                            {item.name}
                        </span>
                    <span className="item-info-text__time">
                        <i className="icon-clock"/><span>{getNextTime(item.time)}</span>
                    </span>
                </div>
            </div>
            <div className="item-control">
                <a className="item-control__link" href={site} target="_blank" rel="noreferrer">
                    <span className="text">Перейти к просмотру<i className="icon-angel-rigrt"/></span>
                </a>
                <div className="item-control__close" onClick={()=>{onRemove(site)}}>
                    <span className="text"><i className="icon-times"/></span>
                </div>
            </div>
        </div>
    )
}