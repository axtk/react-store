import {useContext, useState, useEffect} from 'react';
import {BasicStore} from '@axtk/store';
import StoreContext from './StoreContext';

/**
 * @param {number | string | Store | ImmutableStore} store - a key of a store in StoreProvider or a store instance
 * @returns {Store | ImmutableStore}
 */
export default store => {
    let stores = useContext(StoreContext);
    let [storeRevision, setStoreRevision] = useState();

    store = store instanceof BasicStore ? store : (stores && stores[store]);

    useEffect(() => {
        if (store instanceof BasicStore) {
            return store.onUpdate(() => {
                setStoreRevision(store.getRevision());
            });
        }
    }, [store]);

    return store;
};
