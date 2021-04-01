import { createElement } from 'react';
import { StoreContext } from './StoreContext';
export const StoreProvider = ({ stores, children }) => {
    return createElement(StoreContext.Provider, { value: stores || {} }, children);
};
