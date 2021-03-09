/*global chrome*/
import React from 'react'
import NotifItem from "./NotifItem";

Object.filterForKey = function( obj, predicate) {
    let result = {}, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && !predicate(key)) {
            result[key] = obj[key];
        }
    }

    return result;
};
Object.size = function(obj) {
    let size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

class NotifList extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            notificationList: JSON.parse(localStorage.getItem('notificationList'))
        }
    }
    handleRemove(idItem) {
        let data = Object.filterForKey(this.state.notificationList,(item)=> item === idItem);
        this.setState(prev => {
            prev['notificationList'] = data
            localStorage.setItem('notificationList', JSON.stringify(prev['notificationList']))
            this.setBadge(prev['notificationList'].length)
        })
        this.forceUpdate()
    }
    setBadge(num = 0){
        if(num > 0)
            chrome.browserAction.setBadgeText({text: num + ''});
        else
            chrome.browserAction.setBadgeText({text: ''});
    }
    render() {
        return (
            <>
                {
                    Object.size(this.state.notificationList) ? (
                        <div className="main-content" data-role="tab" data-tab-name="notification">
                            {
                                Object.keys(this.state.notificationList).reverse().map((item,i)=>{
                                    return (
                                        <NotifItem key={i} item={this.state.notificationList[item]} id={item} onRemove={this.handleRemove.bind(this)}/>
                                    )
                                })
                            }
                        </div>
                    ) : (
                        <div className="empty">
                            <span className="empty-text empty-text__notification">
                                Новых уведомлений нет!
                            </span>
                        </div>
                    )
                }
            </>
        )
    }
}

export default NotifList
