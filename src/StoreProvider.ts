import {createElement, FC} from 'react';
import {AbstractStore} from '@axtk/store';
import {StoreContext} from './StoreContext';
import type {ReactStore, StoreCollection} from './types';

export type StoreProviderProps = {
    value: ReactStore | StoreCollection;
}

export const StoreProvider: FC<StoreProviderProps> = ({value, children}) => {
    if (value instanceof AbstractStore)
        value = [value as ReactStore];
    return createElement(StoreContext.Provider, {value: value as StoreCollection}, children);
};
