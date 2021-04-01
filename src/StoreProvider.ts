import {createElement, FC} from 'react';
import {StoreContext} from './StoreContext';
import {StoreCollection} from './types';

export type StoreProviderProps = {
    stores?: StoreCollection;
}

export const StoreProvider: FC<StoreProviderProps> = ({stores, children}) => {
    return createElement(StoreContext.Provider, {value: stores || {} as StoreCollection}, children);
};
