import { useState, useEffect } from 'react';
export * from '@axtk/store';
export function useStoreListener(store, selectUpdateTrigger = (store => store.getRevision()), equal = Object.is) {
    let [value, setValue] = useState(selectUpdateTrigger === null ? undefined : selectUpdateTrigger(store));
    useEffect(() => {
        // Setting the `selectUpdateTrigger` parameter to `null` will prevent the
        // specific component from listening to any updates of the specific store.
        if (selectUpdateTrigger !== null) {
            return store.onUpdate(() => {
                // This handler sets a certain value to the component state whenever the
                // store gets updated in order to trigger a component re-render if the
                // update trigger value has changed.
                // By default, the value used as a component update trigger is the store's
                // revision (which is incremented each time the store data gets updated),
                // and providing a custom `selectUpdateTrigger` function allows to reduce
                // the frequency of the component updates.
                const nextValue = selectUpdateTrigger(store);
                if (!equal(value, nextValue))
                    setValue(nextValue);
            });
        }
    }, [store, selectUpdateTrigger, value, setValue]);
}
