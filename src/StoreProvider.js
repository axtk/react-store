import {createElement} from 'react';
import Store from '@axtk/store';
import StoreContext from './StoreContext';

export default ({stores, children}) => {
    let value;

    if (typeof stores === 'number') {
        value = new Array(stores);
        for (let i = 0; i < value.length; i++)
            value[i] = new Store();
    }
    else value = stores || {};

    return createElement(StoreContext.Provider, {value}, children);
};
