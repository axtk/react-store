import {useState, useEffect} from 'react';
import {useResolvedStore} from './useResolvedStore';
import {StoreCollectionKey, ReactStore} from './types';

export type WatchStore = (store: ReactStore<any>) => any;

const watchRevision = (store: ReactStore<any>) => store.getRevision();

export const useStore = <State>(
    store: StoreCollectionKey | ReactStore<State>,
    watch: WatchStore | null = watchRevision,
): ReactStore<State> => {
    let resolvedStore = useResolvedStore<State>(store);
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
