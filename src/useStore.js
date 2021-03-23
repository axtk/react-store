import {useContext, useState, useEffect} from 'react';
import {BasicStore} from '@axtk/store';
import StoreContext from './StoreContext';

const isStore = x => x instanceof BasicStore;
const watchRevision = store => isStore(store) ? store.getRevision() : undefined;

/**
 * @param {number | string | Store | ImmutableStore} store - a key of a store in StoreProvider or a store instance
 * @param {function | null} [watch] - changes in the returned value of this function will cause re-renders
 * @returns {Store | ImmutableStore}
 */
export default (store, watch = watchRevision) => {
    let stores = useContext(StoreContext);
    store = isStore(store) ? store : (stores && stores[store]);

    let setWatchedValue = useState(watch == null ? undefined : watch(store))[1];
    useEffect(() => {
        if (watch != null && isStore(store)) {
            return store.onUpdate(() => {
                setWatchedValue(watch(store));
            });
        }
    }, [store, watch]);

    return store;
};

