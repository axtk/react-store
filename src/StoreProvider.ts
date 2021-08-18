import {createElement, FC} from 'react';
import {Store} from '@axtk/store';
import {StoreContext} from './StoreContext';
import type {StoreCollection} from './types';

export type StoreProviderProps = {
    value: Store | StoreCollection;
};

export const StoreProvider: FC<StoreProviderProps> = ({value, children}) => {
    return createElement(StoreContext.Provider, {
        value: value instanceof Store ? [value] : value,
    }, children);
};
