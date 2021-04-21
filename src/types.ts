import type {Store, ImmutableStore} from '@axtk/store';

export type ReactStore<State = unknown> = Store<State> | ImmutableStore<State>;
export type StoreCollectionKey = string | number;
export type StoreCollection = ReactStore[] | {[index: string]: ReactStore};
