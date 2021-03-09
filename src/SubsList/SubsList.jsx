/*global chrome*/
import React from 'react'
import SubsItem from "./SubsItem";

// Using chrome functions
const getData = function(_this){
        chrome.storage.local.get(null, function (base) {
            _this.restructData(base);
        })
}
const saveDataToStorage = function (site = null, data) {
    let editedObj = {};
    editedObj[site] = data;
    chrome.storage.local.set(editedObj);
}


class SubsList extends React.Component{

    constructor(props) {
        super(props);
        this.state = {data: {}}
        getData(this);
    }

    setData(site, obj){
        this.setState(prev => {
                prev['data'][site] = obj;
             })
        saveDataToStorage(site, obj);
        this.forceUpdate()
    }

    restructData(data)
    {
        let sortData = [];
        Object.keys(data).map((site)=>{
            if(site !== 'urls' && data[site] !== null && data[site] !== undefined && Object.size(data[site]))
            {
                Object.keys(data[site]).map((item) => {

                   sortData.push({
                       ...data[site][item],
                       urlItem: item
                   });
                   return true;
                })
            }
            return true;
        })
        const compare = function (item1, item2)
        {
           return  item1['time'] > item2['time'];
        };
        sortData.sort(compare);
        this.setState({'data': sortData});
        return sortData;
    }
    // getDataSize(data = {})
    // {
    //     let sizeObj = 0;
    //     if(!Object.size(data))
    //         return sizeObj;
    //     Object.keys(data).map((item)=>{
    //         if(item!== 'urls')
    //             sizeObj += Object.size(data[item])
    //         return item;
    //     })
    //     return sizeObj;
    // }

    // getComponentData(data)
    // {
    //     return Object.keys(data).map((site, i) => {
    //         if (site !== 'urls')
    //             if (data[site] !== null && data[site] !== undefined && Object.size(data[site])) {
    //                 return (<SubsSiteList key={'site' + i} setData={this.setData.bind(this)} data={data[site]} site={site} id={i}/>)
    //             }
    //         return <></>
    //     })
    // }

    render() {
        const data = this.state.data;
        console.log(data.length)
        return (
            <div className="main-content" data-role="tab" data-tab-name="sub">
                {
                    data.length ?
                        (
                            // this.getComponentData(data)
                            data.map((item, i)=>{
                                return <SubsItem key={i} id={i} item={item} site={item['urlItem']} onRemove={()=>{}}/>
                            })
                        )
                        :
                        (
                            <div className="empty">
                                <span className="empty-text">
                                    У вас нет подписок!
                                </span>
                            </div>
                        )
                }
            </div>
        )
    }
}
export default SubsList