import {useContext, useState, useEffect} from 'react';
import Store from '@axtk/store';
import StoreContext from './StoreContext';

/**
 * @param {number | string | Store} store - a key of a store in StoreProvider or a Store class instance
 * @param {function} [onStoreUpdate] - an optional store update callback
 * @returns {Store}
 */
export default (store, onStoreUpdate) => {
    let stores = useContext(StoreContext);
    let [storeRevision, setStoreRevision] = useState();

    store = store instanceof Store ? store : (stores && stores[store]);

    useEffect(() => {
        if (store instanceof Store) {
            return store.onUpdate(() => {
                setStoreRevision(store.getRevision());
                if (onStoreUpdate) onStoreUpdate(store);
            });
        }
    }, [store, onStoreUpdate]);

    return store;
};
