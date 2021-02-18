import Store from 'store';

export default (store, stores) => {
    if (store instanceof Store)
        return store;

    if (!stores)
        throw new Error('No stores');

    if (stores[store] instanceof Store)
        return stores[store];

    throw new Error(`Not a store: ${store}`);
};
