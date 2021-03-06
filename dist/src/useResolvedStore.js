import { useContext } from 'react';
import { AbstractStore } from '@axtk/store';
import { StoreContext } from './StoreContext';
const DEFAULT_STORE_KEY = 0;
const isStore = (x) => x instanceof AbstractStore;
export const useResolvedStore = (store) => {
    let contextStores = useContext(StoreContext);
    let resolvedStore;
    if (isStore(store))
        resolvedStore = store;
    else {
        if (!contextStores)
            throw new Error('No stores in the store context.');
        let storeKey = (store || DEFAULT_STORE_KEY);
        if (!isStore(contextStores[storeKey]))
            throw new Error(`Not a store: ${storeKey}`);
        resolvedStore = contextStores[storeKey];
    }
    return resolvedStore;
};
