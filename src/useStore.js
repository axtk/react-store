import {useContext, useState, useEffect} from 'react';
import StoreContext from './StoreContext';
import validateStore from '../lib/validateStore';

export default (store, path, defaultValue) => {
    let stores = useContext(StoreContext);
    let [value, setValue] = useState(defaultValue);

    store = validateStore(store, stores);

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
