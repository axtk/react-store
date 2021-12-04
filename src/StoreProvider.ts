import {createElement, PropsWithChildren} from 'react';
import {Store} from '@axtk/store';
import {StoreContext} from './StoreContext';
import type {StoreCollection} from './types';

export type StoreProviderProps<S extends object, D extends number = 5> = {
    value: Store<S, D> | StoreCollection<S, D>;
};

export const StoreProvider = <S extends object, D extends number = 5>(
    {value, children}: PropsWithChildren<StoreProviderProps<S, D>>
) => {
    return createElement(StoreContext.Provider, {
        value: value instanceof Store ? [value as Store<S, D>] : value,
    }, children);
};
