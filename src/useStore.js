import {useState, useEffect} from 'react';

export default (store, path, defaultValue) => {
    let [value, setValue] = useState(defaultValue);

    useEffect(() => {
        return store.onUpdate(() => {
            setValue(path ? store.get(path) : store.getState());
        });
    }, [store, path]);

    let storeValue = path ? store.get(path) : store.getState();

    return [
        storeValue === undefined ? defaultValue : storeValue,
        value => path ? store.set(path, value) : store.setState(value),
    ];
};
