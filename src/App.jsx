import React from 'react'
import NotifList from './NotifList/NotifList'
import SubsList from './SubsList/SubsList';
import SimpleBarReact from "simplebar-react";

import "simplebar/src/simplebar.css";


class App extends React.Component{

    childRefNotif = React.createRef()
    childRefSublist = React.createRef()

    tabsOnClick = (e) => {
        let tabIndex;
        document.querySelector('.header__btn.active').classList.remove('active')
        document.querySelector('.visible').classList.remove('visible')
        e.currentTarget.classList.add('active')
        if(e.currentTarget.getAttribute('data-tab-name') !== 'notification')
        {
            tabIndex = 1;
            document.querySelector('.filter').classList.add('visible')
        }
        else
        {
            tabIndex = 0;
            document.querySelector('.notif-footer').classList.add('visible')
        }
        document.querySelector('.main-container').setAttribute('style', `transform: translate3d(${-440 * tabIndex}px, 0, 0)`);
        document.querySelector('.header__tab').setAttribute('style', `transform: translate3d(${tabIndex === 0 ? '0' : '100'}%, 0, 0`);
    }

    clearNotifAll = () => {
        localStorage.setItem('notificationList', null)
        this.childRefNotif.current.setState(prev =>{
            prev['notificationList'] = {}
            this.childRefNotif.current.setBadge(0)
            this.childRefNotif.current.forceUpdate();
        })
    }

    changeSort(e, type = ""){
        console.log(type)
        document.querySelector('.sort.active').classList.remove('active')
        e.currentTarget.classList.add('active');
        this.childRefSublist.current.sortData([],type);
    }

    render() {
        return (
            <div className="body">
                <header className="header">
                    <div className="header-container">
                        <div onClick={this.tabsOnClick} className="header__btn active" data-role="tab" data-tab-name="notification">Уведомления</div>
                        <div onClick={this.tabsOnClick} className="header__btn" data-role="tab" data-tab-name="subs">Подписки</div>
                        <div className="header__tab"/>
                    </div>
                </header>

                <main className="main">
                    <div className="main-container">
                        <SimpleBarReact style={{ minWidth: 440 , minHeight: 502, maxHeight: 502}} autoHide={false}>
                            <NotifList ref={this.childRefNotif}/>
                        </SimpleBarReact>
                        <SimpleBarReact style={{ minWidth: 440 , minHeight: 502, maxHeight: 502}} autoHide={false}>
                            <SubsList ref={this.childRefSublist}/>
                        </SimpleBarReact>
                    </div>
                </main>

                <footer className="footer">
                    <div className="footer-container">
                        <div className="filter">
                            <span className="text">Сортировать по: </span>
                            <span className="text sort sort-type-time active" onClick={(e)=>{this.changeSort(e, 'time')}}>времени</span>
                            <span className="text">/</span>
                            <span className="text sort sort-type-name" onClick={(e)=>{this.changeSort(e, 'name')}}>названию</span>
                        </div>
                        <div className="notif-footer visible">
                            <span className="small-button" onClick={this.clearNotifAll}>Очистить всё</span>
                        </div>
                    </div>
                </footer>
            </div>
        )
    };
}

export default App;