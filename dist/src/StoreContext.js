import { createContext } from 'react';
import { Store } from '@axtk/store';
function createStoreCollectionContext(value) {
    return createContext(value);
}
export const StoreContext = createStoreCollectionContext([new Store()]);
