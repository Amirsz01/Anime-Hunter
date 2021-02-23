import React from 'react'

export default function NotifItem({id,item,onRemove}) {
    return(
        <div className="item" data-id={id}>
            <div className="item-info">
                <div className="item-info__poster" style={{backgroundImage: `url(${item.image})`}}/>
                <div className="item-info-text">
                    <span className="item-info-text__title">
                        {item.title}
                    </span>
                    <span className="item-info-text__time">
                        {item.body}
                    </span>
                </div>
            </div>
            <div className="item-control">
                <a className="item-control__link" href={item.url} target="_blank" rel="noreferrer">
                    <span className="text">Перейти к просмотру<i className="icon-angel-rigrt"/></span>
                </a>
                <div className="item-control__close" onClick={()=>{onRemove(id)}}>
                    <span className="text"><i className="icon-times"/></span>
                </div>
            </div>
        </div>
    )
}