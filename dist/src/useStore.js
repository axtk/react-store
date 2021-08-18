import { useState, useEffect } from 'react';
import { useResolvedStore } from './useResolvedStore';
const getRevision = (store) => store.getRevision();
export function useStore(store, getUpdateMarker) {
    if (typeof store === 'function' || store === null) {
        getUpdateMarker = store;
        store = undefined;
    }
    if (getUpdateMarker === undefined)
        getUpdateMarker = getRevision;
    let resolvedStore = useResolvedStore(store);
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
