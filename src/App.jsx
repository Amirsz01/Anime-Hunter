import React from 'react'
import NotifList from './NotifList/NotifList'
import SubsList from './SubsList/SubsList';
import SimpleBarReact from "simplebar-react";

import "simplebar/src/simplebar.css";

function App() {

    const tabsonClick = (e) => {
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

    return (
    <div className="body">
        <header className="header">
            <div className="header-container">
                <div onClick={tabsonClick} className="header__btn active" data-role="tab" data-tab-name="notification">Уведомления</div>
                <div onClick={tabsonClick} className="header__btn" data-role="tab" data-tab-name="subs">Подписки</div>
                <div className="header__tab"/>
            </div>
        </header>

        <main className="main">
            <div className="main-container">
                <SimpleBarReact style={{ minWidth: 440 , minHeight: 502, maxHeight: 502}} autoHide={false}>
                    <NotifList/>
                </SimpleBarReact>
                <SimpleBarReact style={{ minWidth: 440 , minHeight: 502, maxHeight: 502}} autoHide={false}>
                    <SubsList/>
                </SimpleBarReact>
            </div>
        </main>

        <footer className="footer">
            <div className="footer-container">
                <div className="filter">
                    <span className="text">Сортировать по: </span>
                    <span className="text sort sort-type-time">времени</span>
                    <span className="text">/</span>
                    <span className="text sort sort-type-name">названию</span>
                </div>
                <div className="notif-footer visible">
                    <span className="small-button">Очистить всё</span>
                </div>
            </div>
        </footer>
    </div>
    );
}

export default App;