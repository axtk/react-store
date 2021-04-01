import { useState, useEffect } from 'react';
import { useResolvedStore } from './useResolvedStore';
const watchRevision = (store) => store.getRevision();
export const useStore = (store, watch = watchRevision) => {
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
