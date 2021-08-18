import type {Store} from '@axtk/store';

export type StoreCollectionKey = string | number;
export type StoreCollection = Store[] | {[key: string]: Store};
export type StoreRef = StoreCollectionKey | Store | undefined;
