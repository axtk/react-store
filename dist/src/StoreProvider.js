import { createElement } from 'react';
import { Store } from '@axtk/store';
import { StoreContext } from './StoreContext';
export const StoreProvider = ({ value, children }) => {
    return createElement(StoreContext.Provider, {
        value: value instanceof Store ? [value] : value,
    }, children);
};
