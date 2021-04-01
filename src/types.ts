import type {AbstractStore} from '@axtk/store';

export type StoreCollectionKey = string | number;

export type StoreCollection = {
    [index: string]: AbstractStore;
}
