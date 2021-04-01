import {useContext} from 'react';
import {AbstractStore} from '@axtk/store';
import {StoreContext} from './StoreContext';
import {StoreCollectionKey} from './types';

const isStore = (x: any) => x instanceof AbstractStore;

export const useResolvedStore = (store: AbstractStore | StoreCollectionKey): AbstractStore => {
    let contextStores = useContext(StoreContext);
    let resolvedStore: AbstractStore;

    if (isStore(store))
        resolvedStore = store as AbstractStore;
    else {
        if (!contextStores)
            throw new Error('No stores in the store context.');

        let storeKey = store as StoreCollectionKey;

        if (!isStore(contextStores[storeKey]))
            throw new Error(`Not a store: ${storeKey}`);

        resolvedStore = contextStores[storeKey];
    }

    return resolvedStore;
};
