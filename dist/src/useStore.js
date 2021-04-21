import { useState, useEffect } from 'react';
import { useResolvedStore } from './useResolvedStore';
const watchRevision = (store) => store.getRevision();
export function useStore(store, watch) {
    if (typeof store === 'function' || store === null) {
        watch = store;
        store = undefined;
    }
    if (watch === undefined)
        watch = watchRevision;
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
}
