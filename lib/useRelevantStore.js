import {useContext} from 'react';
import Store from 'store';
import StoreContext from '../src/StoreContext';

export default store => {
    let stores = useContext(StoreContext);
    return store instanceof Store ? store : (stores && stores[store]);
};
