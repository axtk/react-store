import {createContext} from 'react';
import {Store} from '@axtk/store';
import type {StoreCollection} from './types';

function createStoreCollectionContext<S extends object, D extends number = 5>(
    value: StoreCollection<S, D>,
) {
    return createContext(value);
}

export const StoreContext = createStoreCollectionContext([new Store()]);
