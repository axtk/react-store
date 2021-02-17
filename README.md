# react-store

This package extends *[store](https://github.com/axtk/store)* with the React hooks:
- `useStore(store, valuePath?, defaultValue?)`
- `useStoreUpdate(store, callback, dependencies?)`

## Example

```js
// stores/TaskStore.js
import {Store, useStore} from 'react-store';

export const TaskStore = new Store();
export const useTaskStore = useStore.bind(null, TaskStore);
```

The component below will be rendered based on the data retrieved from `TaskStore`. `TaskStore` can be filled in several ways:

- on the server during the server-side rendering phase, or
- from a serialized object during client-side rendering, or
- inside the `useEffect` hook when the component gets mounted.

In all of these setups, the component's code remains the same.

```jsx
// components/TaskCard.jsx
import {useEffect} from 'react';
import {TaskStore, useTaskStore} from '../stores/TaskStore';

export default ({id}) => {
    let [taskData, setTaskData] = useTaskStore(id);
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
        <div className="task-card">
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
