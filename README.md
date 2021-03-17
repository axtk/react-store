[![npm](https://img.shields.io/npm/v/@axtk/react-store?labelColor=royalblue&color=royalblue&style=flat-square)](https://www.npmjs.com/package/@axtk/react-store)
![browser](https://img.shields.io/badge/browser-✓-blue?labelColor=dodgerblue&color=dodgerblue&style=flat-square)
[![SSR](https://img.shields.io/badge/SSR-✓-blue?labelColor=dodgerblue&color=dodgerblue&style=flat-square)](#ssr)

*React store and the related hook for unopinionated shared state management*

In the following code sample, an instance of the `Store` class represents a storage for data shared across multiple components. `<StoreProvider>` specifies the stores available to all nested components:

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

The `stores` prop accepts either a key-value map or an array of stores.

Further on, the provided store can be retrieved by its key (or index) by means of the `useStore` hook:

```jsx
// App.jsx
import {useEffect} from 'react';
import {useStore} from '@axtk/react-store';

export default ({id}) => {
    let taskStore = useStore('TaskStore');
    // The `useStore` hook accepts a key of a store from the
    // `<StoreProvider>` or an instance of the `Store` class.
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
            // `taskData` (below) as well.
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

Although the `useStore` hook responds to updates occurring anywhere in the specific store, the workings of the React's virtual DOM reconciliation mechanism help apply only necessary updates to the real DOM. Also, using multiple stores in complex applications, apart from the semantic separation of concerns, helps avoid receiving irrelevant updates in the components at an even earlier stage.

### Custom store-specific hooks

Optionally, the hooks associated with the stores available to the application can be collected in a single place to be further reused:

```js
// stores.js
import {useStore} from '@axtk/react-store';
export const useTaskStore = useStore.bind(null, 'TaskStore');
```

The store keys can also be collected within a single enum or a constant object.

### `Store` and `ImmutableStore`

These are the two classes representing stores included in this package. Both classes have nearly identical APIs, both of them can be used interchangeably in the examples discussed here.

`Store` is a lightweight store that stores data chunks as they are, and implies that data chunks that have been passed to a store or retrieved from it should be handled as read-only to avoid changes in the store state without notifying its listeners.

`ImmutableStore` is a less lightweight store that maintains immutability of its internal state, receives and returns mutation-safe data chunks, and performs additional data processing under the hood for that purpose.

# Server-side rendering (SSR)

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

# Local stores for async and persistent state

Since the `useStore` hook accepts standalone instances of the `Store` class (not necessarily coming from a `<StoreProvider>`), a store instance created specifically for a component can be passed to the hook to be further used as an unmount-safe and remount-persistent storage for asynchronously fetched data intended for local use.

By saving the store state to `localStorage` in a store update handler, a store can be further enhanced to maintain state persistence across page reloads.

```jsx
// A locally created store can act as a kind of the component's local
// state persistent across unmounts and remounts.
const itemStore = new Store();

const Item = ({id}) => {
    useStore(itemStore);

    // Saving the store state to localStorage makes the component's
    // state persistent across page reloads.
    useEffect(() => {
        try {
            let state = JSON.parse(localStorage.getItem('items'));
            if (state != null) itemStore.setState(state);
        }
        catch(e) {}

        // (The `onUpdate` method returns an unsubscription function
        // enabling the `useEffect` hook to complete its lifecycle.)
        return itemStore.onUpdate(() => {
            try {
                let value = JSON.stringify(itemStore.getState());
                localStorage.setItem('items', value);
            }
            catch(e) {}
        });
    }, [itemStore]);

    useEffect(() => {
        // Fetching and pushing async data to itemStore.
        // ... itemStore.set(id, {data, loading: false});
    }, [itemStore]);

    let {data, loading} = itemStore.get(id);

    // Rendering the item.
};
```

# Also

- *[@axtk/store](https://github.com/axtk/store)*, the store classes without React hooks
