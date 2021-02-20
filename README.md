# react-store

An instance of the `Store` class, inherited from the *[store](https://github.com/axtk/store)* package, represents a storage for data shared across multiple components.

`<StoreProvider>` specifies the stores available to the nested components (either as a key-value map or an array):

```jsx
// index.js
import ReactDOM from 'react-dom';
import {Store, StoreProvider} from 'react-store';
import App from './App';

ReactDOM.render(
    <StoreProvider stores={{TaskStore: new Store()}}><App/></StoreProvider>,
    document.querySelector('#app')
);
```

Further on, the provided store can be retrieved by its key by means of the `useStore` hook.

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

This is essentially all of it, but some minor improvements can be added to this.

The store keys available to the application and optionally the hooks associated with them can be collected in a single place to be further reused:

```js
// stores.js
import {useStore} from 'react-store';

export const Stores = {
    TASK_STORE: 'TaskStore'
};

export const useTaskStore = useStore.bind(null, Stores.TASK_STORE);
```

It can be handy to split shared data among multiple stores, each dealing with a specific type of data or a specific role. Since all stores passed to `StoreProvider` are initialized in the same manner, there is a shorthand option to create a necessary number of stores by passing a number to the `stores` prop, which is equivalent to passing an array of stores of that length:

```jsx
ReactDOM.render(
    <StoreProvider stores={1}><App/></StoreProvider>,
    document.querySelector('#root')
);
```

If the stores in a `StoreProvider` are an array, each individual store can be retrieved by an index:

```js
// stores.js
import {useStore} from 'react-store';

export const Stores = {
    TASK_STORE: 0 // used to be 'TaskStore' when `stores` were a key-value map
};

export const useTaskStore = useStore.bind(null, Stores.TASK_STORE); // unchanged
```

## SSR

While rendering server-side, it can be convenient to pass pre-filled stores to the application, so that the components were rendered according to the store data:

```jsx
// ... imports
import {StoreProvider, Store} from 'react-store';

// with Express
app.get('/', prefetchAppData, (req, res) => {
    // `TaskStore` is filled with the data, previously fetched and put
    // into the request `req` object in the `prefetchAppData` middleware
    const html = ReactDOMServer.renderToString(
        <StoreProvider stores={{TaskStore: new Store(req.prefetchedAppData.tasks)}}>
            <App/>
        </StoreProvider>
    );

    const serializedAppData = JSON.stringify(req.prefetchedAppData)
        .replace(/</g, '\\u003c');

    res.send(`
        <!doctype html>
        <html>
            <head><title>App</title></head>
            <body>
                <div id="app">${html}</div>
                <script>window._prefetchedAppData = ${serializedAppData};</script>
                <script src="/index.js"></script>
            </body>
        </html>
    `);
});
```

When the application is rendered in the browser, the browser store instances can be filled with the serialized data to match the rendered state:

```jsx
// index.js
// ... imports

ReactDOM.hydrate(
    <StoreProvider stores={{TaskStore: new Store(window._prefetchedAppData.tasks)}}>
        <App/>
    </StoreProvider>,
    document.querySelector('#app')
);

delete window._prefetchedAppData;
```
