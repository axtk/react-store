import {useState, useEffect} from 'react';
import {useResolvedStore} from './useResolvedStore';
import {StoreCollectionKey, ReactStore} from './types';

const watchRevision = (store: ReactStore) => store.getRevision();

export type WatchStore = (store: ReactStore) => any;

type StoreArg<T> = StoreCollectionKey | ReactStore<T> | undefined;
type WatchArg = WatchStore | null;

export function useStore<State>(watch?: WatchArg): ReactStore<State>;
export function useStore<State>(store: StoreArg<State>, watch?: WatchArg): ReactStore<State>;

export function useStore<State>(
    store?: StoreArg<State> | WatchArg,
    watch?: WatchArg,
): ReactStore<State> {
    if (typeof store === 'function' || store === null) {
        watch = store as WatchArg;
        store = undefined;
    }

    if (watch === undefined)
        watch = watchRevision;

    let resolvedStore = useResolvedStore<State>(store as StoreArg<State>);
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
