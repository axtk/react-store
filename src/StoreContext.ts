import {createContext} from 'react';
import {Store} from '@axtk/store';
import type {StoreCollection} from './types';

function createStoreCollectionContext<S extends object, N extends number>(
    value: StoreCollection<S, N>,
) {
    return createContext(value);
}

export const StoreContext = createStoreCollectionContext([new Store()]);
