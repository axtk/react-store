import {useContext} from 'react';
import {Store} from '@axtk/store';
import {StoreContext} from './StoreContext';
import type {StoreRef, StoreCollectionKey} from './types';

const DEFAULT_STORE_KEY = 0;

export function useResolvedStore(store: StoreRef): Store {
    let contextStores = useContext(StoreContext);
    let resolvedStore: Store;

    if (store instanceof Store)
        resolvedStore = store;
    else {
        if (!contextStores)
            throw new Error('No stores in the store context.');

        let storeKey = store || DEFAULT_STORE_KEY;

        if (!(contextStores[storeKey] instanceof Store))
            throw new Error(`Not a store: ${storeKey}`);

        resolvedStore = contextStores[storeKey];
    }

    return resolvedStore;
}
