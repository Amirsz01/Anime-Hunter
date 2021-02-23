import React from 'react'
import SubsItem from "./SubsItem";

Object.filterForKey = function( obj, predicate) {
    let result = {}, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && !predicate(key)) {
            result[key] = obj[key];
        }
    }

    return result;
};

function SubsSiteList({setData, data, site}) {
    function handleRemove(idItem) {
        data = Object.filterForKey(data,(item)=> item === idItem);
        setData(site, data);
    }
    return (
        Object.keys(data).map((item,i)=> {
            return (
                <SubsItem key={site+i} item={data[item]} site={item} id={i} onRemove={handleRemove}/>
            )
        })
    )
}

export default  SubsSiteList;