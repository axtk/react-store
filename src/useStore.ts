import {useState, useEffect} from 'react';
import type {AbstractStore} from '@axtk/store';
import {useResolvedStore} from './useResolvedStore';
import {StoreCollectionKey} from './types';

export type WatchStore = (store: AbstractStore) => any;

const watchRevision = (store: AbstractStore) => store.getRevision();

export const useStore = (
    store: AbstractStore | StoreCollectionKey,
    watch: WatchStore | null = watchRevision,
): AbstractStore => {
    let resolvedStore = useResolvedStore(store);
    let setWatchedValue = useState(watch == null ? undefined : watch(resolvedStore))[1];

    useEffect(() => {
        if (watch != null) {
            return resolvedStore.onUpdate(() => {
                setWatchedValue(watch(resolvedStore));
            });
        }
    }, [resolvedStore, watch]);

    return resolvedStore;
};
