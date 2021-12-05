import {useState, useEffect} from 'react';
import {Store} from '@axtk/store';

export * from '@axtk/store';

export function useStoreListener<
    State extends object,
    TypedKeyPathDepth extends number = 5
>(
    store: Store<State, TypedKeyPathDepth>,
    updateTriggerSelector: ((store: Store<State, TypedKeyPathDepth>) => any) | null = (store => store.getRevision()),
    equal: (prev: any, next: any) => boolean = Object.is,
): void {
    let [value, setValue] = useState(
        updateTriggerSelector === null ? undefined : updateTriggerSelector(store)
    );

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
                if (!equal(value, nextValue)) setValue(nextValue);
            });
        }
    }, [store, updateTriggerSelector, value, setValue]);
}
