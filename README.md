# react-store

This package extends *[store](https://github.com/axtk/store)* with the React hooks:

- `useStore(store, valuePath?, defaultValue?)`,
- `useStoreUpdate(store, callback, dependencies?)`,

and the `<StoreProvider>` component.

## Example

`<StoreProvider>` specifies the stores available to the nested components:

```jsx
// index.js
import ReactDOM from 'react-dom';
import {Store, StoreProvider} from 'react-store';
import App from './App';

ReactDOM.render(
    <StoreProvider stores={{TaskStore: new Store()}}><App/></StoreProvider>,
    document.querySelector('#root')
);
```

An instance of the `Store` class represents a storage for scoped data shared across multiple components.

Stores can be filled in several ways:

- on the server during the server-side rendering phase, or
- from a serialized object during client-side rendering, or
- inside a component's `useEffect` hook when it gets mounted.

In all of these setups, the code of the components that are rendered based on the store data remains the same.

```jsx
// App.jsx
import {useEffect} from 'react';
import {useStore} from 'react-store';

export default ({id}) => {
    let [TaskStore, taskData, setTaskData] = useStore('TaskStore', id);
    // Initially, `TaskStore` is empty and `taskData` is undefined.
    // The `useTaskStore` hook will push updates on `TaskStore` to `taskData`.

    useEffect(() => {
        // If the data was already in the store, this effect can be skipped.
        if (taskData) return;

        fetch(`/tasks/${id}`)
            .then(res => res.json())
            .then(taskData => TaskStore.set(id, taskData));
            // `TaskStore.set()` will cause an update in `TaskStore` and then in
            // `taskData` (and elsewhere where the `useStore('TaskStore')` hook is used).
    }, []);

    if (!taskData)
        return null;

    return (
        <div className="app">
            <div class="type">
                Type: <strong>{taskData.type}</strong>
            </div>
            <div class="status">
                Status: <strong>{taskData.status}</strong>
            </div>
        </div>
    );
};
```

Since all stores passed to `StoreProvider` are initialized in the same manner, there is a shorthand option to create a necessary number of stores by passing a number to the `stores` prop, which is equivalent to passing an array of stores of that length:

```jsx
ReactDOM.render(
    <StoreProvider stores={1}><App/></StoreProvider>,
    document.querySelector('#root')
);
```

If the stores in a `StoreProvider` are an array, each individual store can be retrieved by an index:

```js
let [TaskStore, taskData, setTaskData] = useStore(0, id);
```

For readability, the store keys can be mapped to self-explaining names either by collecting them in a standalone enum (`useStore(Stores.TASK_STORE, valueKey)`) or by wrapping them up with new dedicated hooks (`const useTaskStore = useStore.bind(null, 0);`).
