import {useContext, useEffect} from 'react';
import StoreContext from './StoreContext';
import validateStore from '../lib/validateStore';

export default (store, callback, deps) => {
    let baseDeps = [store, callback];
    let stores = useContext(StoreContext);

    store = validateStore(store, stores);

    useEffect(() => {
        return store.onUpdate(() => {
            callback(store);
        });
    }, deps ? baseDeps.concat(deps) : baseDeps);
};
