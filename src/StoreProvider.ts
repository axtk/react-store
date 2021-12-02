import {createElement, PropsWithChildren} from 'react';
import {Store} from '@axtk/store';
import {StoreContext} from './StoreContext';
import type {StoreCollection} from './types';

export type StoreProviderProps<S extends object, N extends number> = {
    value: Store<S, N> | StoreCollection<S, N>;
};

export const StoreProvider = <S extends object, N extends number>(
    {value, children}: PropsWithChildren<StoreProviderProps<S, N>>
) => {
    return createElement(StoreContext.Provider, {
        value: value instanceof Store ? [value] : value,
    }, children);
};
