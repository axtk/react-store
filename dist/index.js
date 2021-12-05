import { useState, useEffect } from 'react';
export * from '@axtk/store';
export function useStoreListener(store, updateTriggerSelector = (store => store.getRevision()), equal = Object.is) {
    let [value, setValue] = useState(updateTriggerSelector === null ? undefined : updateTriggerSelector(store));
    useEffect(() => {
        // Setting the `updateTriggerSelector` parameter to `null` will prevent the
        // specific component from listening to any updates of the specific store.
        if (updateTriggerSelector !== null) {
            return store.onUpdate(() => {
                // This handler sets a certain value to the component state whenever the
                // store gets updated in order to trigger a component re-render if the
                // update trigger value has changed.
                // By default, the value used as a component update trigger is the store's
                // revision (which is incremented each time the store data gets updated),
                // and providing a custom `updateTriggerSelector` function allows to reduce
                // the frequency of the component updates.
                const nextValue = updateTriggerSelector(store);
                if (!equal(value, nextValue))
                    setValue(nextValue);
            });
        }
    }, [store, updateTriggerSelector, value, setValue]);
}
