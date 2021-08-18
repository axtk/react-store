import {createContext} from 'react';
import {Store} from '@axtk/store';
import type {StoreCollection} from './types';

export const StoreContext = createContext<StoreCollection>([new Store()]);
