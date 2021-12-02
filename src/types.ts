import type {Store} from '@axtk/store';

export type StoreCollection<S extends object, N extends number> =
    Store<S, N>[] | Record<PropertyKey, Store<S, N>>;

export type StoreRef<S extends object, N extends number> =
    PropertyKey | Store<S, N> | undefined;
