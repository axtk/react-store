import { createElement } from 'react';
import { AbstractStore } from '@axtk/store';
import { StoreContext } from './StoreContext';
export const StoreProvider = ({ value, children }) => {
    if (value instanceof AbstractStore)
        value = [value];
    return createElement(StoreContext.Provider, { value: value }, children);
};
