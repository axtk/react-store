[![npm](https://img.shields.io/npm/v/@axtk/react-store?labelColor=royalblue&color=royalblue&style=flat-square)](https://www.npmjs.com/package/@axtk/react-store)
![browser](https://img.shields.io/badge/browser-✓-blue?labelColor=dodgerblue&color=dodgerblue&style=flat-square)
[![SSR](https://img.shields.io/badge/SSR-✓-blue?labelColor=dodgerblue&color=dodgerblue&style=flat-square)](#ssr)

*React store and the related hook for unopinionated shared state management*

The state of an application is often distributed between local state enclosed within a specific component and shared data residing in the outer scope of the components and accessible from within many of them. While local state can be retrieved by means of the built-in `useState` React hook, this package provides a React hook to deal with shared state.

In the following code sample, an instance of the `Store` class represents a storage for data shared across multiple components. `<StoreProvider>` specifies the stores available to the nested components:

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

The `stores` prop accepts either a key-value map or an array of stores. (Also, passing an arbitrary number `n` to the `stores` prop is equivalent to passing an array of `n` empty stores.)

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
    // The component will safely quit listening to the store updates
    // under the hood when it gets unmounted.

    useEffect(() => {
        // If the required data is already in the store, this effect
        // can be skipped.
        if (taskStore.get(id)) return;

        fetch(`/tasks/${id}`)
            .then(res => res.json())
            .then(data => taskStore.set(id, data));
            // Whenever the store gets updated the `useStore`
            // hook will cause a re-render causing an update in
            // `taskData` as well.
    }, [taskStore]);

    let taskData = taskStore.get(id);
    // If not pre-filled, `taskStore` is initially empty and `taskData`
    // is undefined until the above effect completes the request.

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

Although the `useStore` hook responds to updates occurring anywhere in the specific store, the least required immutability maintained by the `Store` class (which means updating only the changed branch of the stored data) helps the React's virtual DOM reconciliation mechanism to apply only necessary updates to the real DOM. Also, using multiple stores in complex applications, apart from the semantic separation of concerns, helps avoid receiving irrelevant updates in the components at an even earlier stage.

### Custom store-specific hooks

Optionally, the hooks associated with the stores available to the application can be collected in a single place to be further reused:

```js
// stores.js
import {useStore} from '@axtk/react-store';
export const useTaskStore = useStore.bind(null, 'TaskStore');
```

The store keys can also be collected within a single enum or a constant object.

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
