import type {Store} from '@axtk/store';

export type StoreRef<State extends object, TypedKeyPathDepth extends number = 5> =
    PropertyKey | Store<State, TypedKeyPathDepth> | undefined;

export type StoreCollection<S extends object, D extends number = 5> =
    Store<S, D>[] | Record<PropertyKey, Store<S, D>>;
