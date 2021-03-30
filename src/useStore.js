import {useContext, useState, useEffect} from 'react';
import {BasicStore} from '@axtk/store';
import StoreContext from './StoreContext';

const isStore = x => x instanceof BasicStore;
const watchRevision = store => store.getRevision();

/**
 * @param {number | string | Store | ImmutableStore} store - a key of a store in StoreProvider or a store instance
 * @param {function | null} [watch] - the hook will cause a re-render if the returned value of this function changes
 * @returns {Store | ImmutableStore}
 */
export default (store, watch = watchRevision) => {
    let contextStores = useContext(StoreContext);

    if (!isStore(store)) {
        if (!contextStores)
            throw new Error('No stores in the store context.');

        if (!isStore(contextStores[store]))
            throw new Error(`Not a store: ${store}`);

        store = contextStores[store];
    }

    let setWatchedValue = useState(watch == null ? undefined : watch(store))[1];

    useEffect(() => {
        if (watch != null) {
            return store.onUpdate(() => {
                setWatchedValue(watch(store));
            });
        }
    }, [store, watch]);

    return store;
};
