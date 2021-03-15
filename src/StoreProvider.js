import {createElement} from 'react';
import StoreContext from './StoreContext';

/**
 * @param {object | Array} stores - A key-value map or an array of stores
 * @param {*} children - Nested components
 * @returns {object} - `<StoreProvider>` component
 */
export default ({stores, children}) => {
    return createElement(StoreContext.Provider, {value: stores || {}}, children);
};
