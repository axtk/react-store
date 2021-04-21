import {useContext} from 'react';
import {AbstractStore} from '@axtk/store';
import {StoreContext} from './StoreContext';
import {StoreCollectionKey, ReactStore} from './types';

const DEFAULT_STORE_KEY = 0;
const isStore = (x: any) => x instanceof AbstractStore;

export const useResolvedStore = <State>(
    store: StoreCollectionKey | ReactStore<State> | undefined
): ReactStore<State> => {
    let contextStores = useContext(StoreContext);
    let resolvedStore: ReactStore<State>;

    if (isStore(store))
        resolvedStore = store as ReactStore<State>;
    else {
        if (!contextStores)
            throw new Error('No stores in the store context.');

        let storeKey = (store || DEFAULT_STORE_KEY) as StoreCollectionKey;

        if (!isStore(contextStores[storeKey]))
            throw new Error(`Not a store: ${storeKey}`);

        resolvedStore = contextStores[storeKey];
    }

    return resolvedStore;
};
