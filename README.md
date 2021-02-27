[![npm](https://img.shields.io/npm/v/@axtk/react-store?labelColor=royalblue&color=royalblue&style=flat-square)](https://www.npmjs.com/package/@axtk/react-store)
![browser](https://img.shields.io/badge/browser-✓-blue?labelColor=dodgerblue&color=dodgerblue&style=flat-square)
[![SSR](https://img.shields.io/badge/SSR-✓-blue?labelColor=dodgerblue&color=dodgerblue&style=flat-square)](#ssr)

*React store and related hooks for shared state management*

An instance of the `Store` class represents a storage for data shared across multiple components. `<StoreProvider>` specifies the stores available to the nested components:

```jsx
// index.js
import ReactDOM from 'react-dom';
import {Store, StoreProvider} from '@axtk/react-store';
import App from './App';

ReactDOM.render(
    <StoreProvider stores={{TaskStore: new Store()}}>
        <App/>
    </StoreProvider>,
    document.querySelector('#app')
);
```

The `stores` prop accepts either a key-value map or an array of stores. Also, passing an arbitrary number `n` to the `stores` prop is equivalent to passing an array of `n` empty stores.

Further on, the provided store can be retrieved by its key (or index) by means of the `useStore` hook:

```jsx
// App.jsx
import {useEffect} from 'react';
import {useStore} from '@axtk/react-store';

export default ({id}) => {
    let taskStore = useStore('TaskStore');
    // The `useStore` hook accepts a key of a store from the
    // `<StoreProvider>` or an instance of the `Store` class as the
    // first argument and, optionally, a store update callback as
    // the second argument.

    let taskData = taskStore.get(id);
    // If not pre-filled, `taskStore` is initially empty and `taskData`
    // is undefined.

    useEffect(() => {
        // If the data was already in the store, this effect can be
        // skipped.
        if (taskData) return;

        fetch(`/tasks/${id}`)
            .then(res => res.json())
            .then(data => taskStore.set(id, data));
            // Whenever the store gets updated the `useStore`
            // hook will cause a re-render causing an update in
            // `taskData` as well.
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

This is essentially all of it.

### Custom store-specific hooks

Optionally, the keys of the stores available to the application and the hooks associated with them can be collected in a single place to be further reused:

```js
// stores.js
import {useStore} from '@axtk/react-store';

export const Stores = {
    TASK_STORE: 'TaskStore'
};

export const useTaskStore = useStore.bind(null, Stores.TASK_STORE);
```

# SSR

While rendering server-side, it can be convenient to pass pre-filled stores to the application, so that the components were rendered according to the store data:

```jsx
// ... imports
import {StoreProvider, Store} from '@axtk/react-store';

// with Express
app.get('/', prefetchAppData, (req, res) => {
    // `TaskStore` is filled with the data previously fetched and put
    // into the request `req` object in the `prefetchAppData` middleware
    const html = ReactDOMServer.renderToString(
        <StoreProvider stores={{
            TaskStore: new Store(req.prefetchedAppData.tasks)
        }}>
            <App/>
        </StoreProvider>
    );

    const serializedAppData = JSON.stringify(req.prefetchedAppData)
        .replace(/</g, '\\x3c');

    res.send(`
        <!doctype html>
        <html>
            <head><title>App</title></head>
            <body>
                <div id="app">${html}</div>
                <script>
                    window._prefetchedAppData = ${serializedAppData};
                </script>
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
    <StoreProvider stores={{
        TaskStore: new Store(window._prefetchedAppData.tasks)
    }}>
        <App/>
    </StoreProvider>,
    document.querySelector('#app')
);

delete window._prefetchedAppData;
```

# Also

- *[store](https://github.com/axtk/store)*, the `Store` class without React hooks
