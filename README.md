# react-store

This package extends *[store](https://github.com/axtk/store)* with the React hooks:
- `useStore(store, valuePath?, defaultValue?)`
- `useStoreUpdate(store, callback, dependencies?)`

## Example

```js
// useTaskStore.js
import {useStore} from 'react-store';

const useTaskStore = useStore.bind(null, 'TaskStore');
export default useTaskStore;
```

The component below will be rendered based on the data retrieved from `TaskStore`. `TaskStore` can be filled in several ways:

- on the server during the server-side rendering phase, or
- from a serialized object during client-side rendering, or
- inside the `useEffect` hook when the component gets mounted.

In all of these setups, the component's code remains the same.

```jsx
// App.jsx
import {useEffect} from 'react';
import useTaskStore from './useTaskStore';

export default ({id}) => {
    let [TaskStore, taskData, setTaskData] = useTaskStore(id);
    // Initially, `TaskStore` is empty and `taskData` is undefined.
    // The `useTaskStore` hook will push updates on `TaskStore` to `taskData`.

    useEffect(() => {
        // If the data was already in the store, this effect can be skipped.
        if (taskData) return;

        fetch(`/tasks/${id}`)
            .then(res => res.json())
            .then(taskData => TaskStore.set(id, taskData));
            // `TaskStore.set()` will cause an update in `TaskStore` and then in
            // `taskData` (and elsewhere where the `useTaskStore` hook was used).
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

Since all stores passed to `StoreProvider` are initialized in the same manner, there is a shorthand option to create a necessary number of stores by passing a number to the `stores` prop, which is equivalent to passing an array of stores of the same length:

```jsx
ReactDOM.render(
    <StoreProvider stores={1}><App/></StoreProvider>,
    document.querySelector('#root')
);
```

If the stores in a `StoreProvider` are an array, each individual store can be retrieved by an index:

```js
const useTaskStore = useStore.bind(null, 0);
```
