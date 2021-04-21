import {createContext} from 'react';
import {Store} from '@axtk/store';
import {StoreCollection} from './types';

export const StoreContext = createContext([new Store()] as StoreCollection);
