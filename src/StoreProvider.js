import {createElement} from 'react';
import Store from '@axtk/store';
import StoreContext from './StoreContext';

export default ({stores, children}) => {
    return createElement(StoreContext.Provider, {value: stores || {}}, children);
};
