import {useContext, useState, useEffect} from 'react';
import {Store} from '@axtk/store';
import {StoreContext} from './StoreContext';
import type {StoreRef} from './types';

const getRevision = <S extends object, D extends number = 5>(store: Store<S, D>) => store.getRevision();

export type GetUpdateTrigger<S extends object, D extends number = 5> =
    ((store: Store<S, D>) => any) | null;

export function useStore<S extends object, D extends number = 5>(
    store?: StoreRef<S, D>,
    getUpdateTrigger?: GetUpdateTrigger<S, D>,
): Store<S, D>;

export function useStore<S extends object, D extends number = 5>(
    getUpdateTrigger?: GetUpdateTrigger<S, D>,
): Store<S, D>;

export function useStore<S extends object, D extends number = 5>(
    store?: StoreRef<S, D> | GetUpdateTrigger<S, D>,
    getUpdateTrigger?: GetUpdateTrigger<S, D>,
): Store<S, D> {
    let contextStores = useContext(StoreContext);

    // Since the first argument can be a store, or a store key in
    // a multi-store setup, or it can be missing altogether, a number
    // of checks are required to figure out the actual store to be
    // further used.
    let resolvedStore: Store, storeKey: PropertyKey;

    if (store instanceof Store)
        resolvedStore = store;
    // Checking for the hook's signature that doesn't specify a store
    // and provides a custom `getUpdateTrigger` function.
    else if (typeof store === 'function' || store === null) {
        getUpdateTrigger = store as GetUpdateTrigger<S, D>;
        storeKey = 0;
    }
    else storeKey = store;

    if (storeKey !== undefined) {
        if (!contextStores)
            throw new Error('No stores in the store context.');

        if (!(storeKey in contextStores))
            throw new Error(`No such entry in the store context: ${String(storeKey)}`);

        if (!(contextStores[storeKey] instanceof Store))
            throw new Error(`Not a store: ${String(storeKey)}`);

        resolvedStore = contextStores[storeKey];
    }

    if (getUpdateTrigger === undefined)
        getUpdateTrigger = getRevision;

    let setUpdateTrigger = useState(
        getUpdateTrigger == null ? undefined : getUpdateTrigger(resolvedStore)
    )[1];

    useEffect(() => {
        // Setting the `getUpdateTrigger` argument to `null` will prevent the
        // specific component from listening to any updates of the specific store.
        if (getUpdateTrigger != null) {
            return resolvedStore.onUpdate(() => {
                // Pushing a new value to the component state is a way to trigger a
                // re-render of the component. At the same time, the workings of the React
                // `useState` hook allow to skip a re-render if the value hasn't changed.

                // This handler sets a certain value to the component state whenever the
                // store gets updated in order to trigger a component re-render, with the
                // React's state comparison optimizations in mind.

                // By default, the value used as a component update trigger is the store's
                // revision (which is incremented each time the store data is updated),
                // and providing a custom `getUpdateTrigger` function allows to modify
                // the frequency of the component updates.
                setUpdateTrigger(getUpdateTrigger(resolvedStore));
            });
        }
    }, [resolvedStore, setUpdateTrigger, getUpdateTrigger]);

    return resolvedStore;
}
