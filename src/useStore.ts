import {useState, useEffect} from 'react';
import type {Store} from '@axtk/store';
import {useResolvedStore} from './useResolvedStore';
import type {StoreRef} from './types';

const getRevision = (store: Store) => store.getRevision();

export type GetUpdateMarker = ((store: Store) => any) | null;

export function useStore(getUpdateMarker?: GetUpdateMarker): Store;
export function useStore(store: StoreRef, getUpdateMarker?: GetUpdateMarker): Store;

export function useStore(
    store?: StoreRef | GetUpdateMarker,
    getUpdateMarker?: GetUpdateMarker,
): Store {
    if (typeof store === 'function' || store === null) {
        getUpdateMarker = store as GetUpdateMarker;
        store = undefined;
    }

    if (getUpdateMarker === undefined)
        getUpdateMarker = getRevision;

    let resolvedStore = useResolvedStore(store as StoreRef);
    let setUpdateMarker = useState(getUpdateMarker == null ? undefined : getUpdateMarker(resolvedStore))[1];

    useEffect(() => {
        if (getUpdateMarker != null) {
            return resolvedStore.onUpdate(() => {
                setUpdateMarker(getUpdateMarker(resolvedStore));
            });
        }
    }, [resolvedStore, getUpdateMarker]);

    return resolvedStore;
}
