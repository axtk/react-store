import {createElement, ReactNode, ReactElement} from 'react';
import {StoreContext} from './StoreContext';
import {StoreCollection} from './types';

export type StoreProviderProps = {
    stores?: StoreCollection;
    children?: ReactNode;
}

export const StoreProvider = ({stores, children}: StoreProviderProps): ReactElement => {
    return createElement(StoreContext.Provider, {value: stores || {} as StoreCollection}, children);
};
