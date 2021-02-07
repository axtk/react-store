import {useEffect} from 'react';

export default (store, callback, deps) => {
    const baseDeps = [store, callback];

    useEffect(() => {
        return store.onUpdate(() => {
            callback(store);
        });
    }, deps ? baseDeps.concat(deps) : baseDeps);
};
