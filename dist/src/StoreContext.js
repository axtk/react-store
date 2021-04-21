import { createContext } from 'react';
import { Store } from '@axtk/store';
export const StoreContext = createContext([new Store()]);
