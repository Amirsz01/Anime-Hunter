/*global chrome*/
import React from 'react'
import SubsItem from "./SubsItem";


// Using chrome functions
const getData = function(_this){
        chrome.storage.local.get(null, function (base) {
            _this.restructData(base);
        })
}
const saveDataToStorage = function (_this, site = null, idItem) {
    let editedObj = _this.state.data_obj;
    if(editedObj[site][idItem] !== null && editedObj[site][idItem] !== undefined)
        delete editedObj[site][idItem]
    else
        console.log("Deleted item is undefined")
    chrome.storage.local.set(editedObj);
}

Object.filterForKey = function( obj, predicate) {
    let result = {}, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && !predicate(key)) {
            result[key] = obj[key];
        }
    }

    return result;
};

class SubsList extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            data_obj: {},
            sort_type: 'time'
        }
        getData(this);
    }

    setData(site, idItem, obj){
        this.setState(prev =>{
            return  {
                ...prev,
                'data': obj
            }
        })
        saveDataToStorage(this, site, idItem)
        this.forceUpdate()
    }
    sortData(data = [], type = this.state.sort_type)
    {
        let saveState = true;
        if(!data.length) {
            data = this.state.data;
            saveState = false;
        }
        if(type === 'name')
            data = data.sort((item1, item2) => item1['name'].localeCompare(item2['name']))
        else
            data = data.sort((item1, item2) => parseInt(item1['time']) - parseInt(item2['time']));
        if(!saveState)
        {
            this.setState(prev=>{
                return {
                    ...prev,
                    'sort_type': type,
                    'data': data
                }
            });
        }
        this.forceUpdate()
        return data;
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
                       urlItem: item,
                       site: site
                   });
                   return true;
                })
            }
            return true;
        })

        sortData = this.sortData(sortData, this.state.sort_type);

        this.setState({
            ...this.state,
            'data': sortData,
            'data_obj': data
        });

        return sortData;
    }

    handleRemove(site, idItem) {
        const newData = this.state.data.filter(item=> item.urlItem !== idItem)
        this.setData(site, idItem, newData);
    }

    render() {
        const data = this.state.data;
        return (
            <div className="main-content" data-role="tab" data-tab-name="sub">
                {
                    data.length ?
                        (
                            data.map((item, i)=>{
                                return <SubsItem key={i} id={i} item={item} site={item['site']} url={item['urlItem']} onRemove={this.handleRemove.bind(this)}/>
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