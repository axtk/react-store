import type {Store, ImmutableStore} from '@axtk/store';

export type ReactStore<State> = Store<State> | ImmutableStore<State>;
export type StoreCollectionKey = string | number;

export type StoreCollection = {
    [index: string]: ReactStore<any>;
}
