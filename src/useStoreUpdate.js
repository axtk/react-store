import {useEffect} from 'react';
import useRelevantStore from '../lib/useRelevantStore';

export default (store, callback, deps) => {
    store = useRelevantStore(store);

    let baseDeps = [store, callback];

    useEffect(() => {
        return store.onUpdate(() => {
            callback(store);
        });
    }, deps ? baseDeps.concat(deps) : baseDeps);
};
