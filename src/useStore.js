import {useState, useEffect} from 'react';
import useRelevantStore from '../lib/useRelevantStore';

export default (store, path, defaultValue) => {
    store = useRelevantStore(store);

    let [value, setValue] = useState(defaultValue);
    let getStoreValue = () => path ? store.get(path) : store.getState();
    let setStoreValue = value => path ? store.set(path, value) : store.setState(value);

    useEffect(() => {
        return store.onUpdate(() => {
            setValue(getStoreValue());
        });
    }, [store, path]);

    let storeValue = getStoreValue();

    return [
        store,
        storeValue === undefined ? defaultValue : storeValue,
        setStoreValue,
    ];
};
