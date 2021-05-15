[![npm](https://img.shields.io/npm/v/@axtk/react-store?labelColor=royalblue&color=royalblue&style=flat-square)](https://www.npmjs.com/package/@axtk/react-store) ![browser](https://img.shields.io/badge/browser-✓-345?labelColor=345&color=345&style=flat-square) [![SSR](https://img.shields.io/badge/SSR-✓-345?labelColor=345&color=345&style=flat-square)](#server-side-rendering-ssr) ![TypeScript](https://img.shields.io/badge/TypeScript-✓-345?labelColor=345&color=345&style=flat-square)

# @axtk/react-store

*Compact shared-state management in vanilla React*

## Zero-config setup

The term *store* will stand for an object where the shared state will reside. A call to the `useStore` hook returns a store and subscribes the component to the store to bring it up-to-date whenever the store gets updated.

The `useStore` hook returns the default store if no store has been explicitly provided.

```jsx
import ReactDOM from 'react-dom';
import {useStore} from '@axtk/react-store';

const Button = () => {
    const store = useStore();

    return (
        <button onClick={
            () => store.set('n', (store.get('n') || 0) + 1)
        }>
            Increment
        </button>
    );
};

const Display = () => {
    const store = useStore();

    return <span>{store.get('n') || 0}</span>;
};

const App = () => <div><Button/> <Display/></div>;

ReactDOM.render(<App/>, document.querySelector('#app'));
```

## Single-store setup

The store can be set up explicitly with the `<StoreProvider>` component.

```jsx
import ReactDOM from 'react-dom';
import {useStore, Store, StoreProvider} from '@axtk/react-store';

const Button = () => {
    const store = useStore();

    return (
        <button onClick={() => store.set('n', store.get('n') + 1)}>
            Increment
        </button>
    );
};

const Display = () => {
    const store = useStore();

    return <span>{store.get('n')}</span>;
};

const App = () => <div><Button/> <Display/></div>;

const initialState = {n: 42};

ReactDOM.render(
    <StoreProvider value={new Store(initialState)}>
        <App/>
    </StoreProvider>,
    document.querySelector('#app')
);
```

## Multi-store setup

Multiple stores can be passed to the `StoreProvider`'s `value` prop and retrieved via the `useStore` hook with the store key as a parameter.

```jsx
import ReactDOM from 'react-dom';
import {useStore, Store, StoreProvider} from '@axtk/react-store';

const App = () => {
    const taskStore = useStore('TaskStore');
    // ...
};

ReactDOM.render(
    <StoreProvider value={{
        TaskStore: new Store(),
        UserStore: new Store()
    }}>
        <App/>
    </StoreProvider>,
    document.querySelector('#app')
);
```

## Server-side rendering (SSR)

On the server, the stores can be pre-filled and passed to `<StoreProvider>` in essentially the same way as in the client-side code.

```jsx
// On an Express server
app.get('/', prefetchAppData, (req, res) => {
    const html = ReactDOMServer.renderToString(
        <StoreProvider value={new Store(req.prefetchedAppData)}>
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

When the application is rendered in the browser, the browser store instance can be filled with the serialized data to match the rendered state.

```jsx
// On the client
ReactDOM.hydrate(
    <StoreProvider value={new Store(window._prefetchedAppData)}>
        <App/>
    </StoreProvider>,
    document.querySelector('#app')
);
```

## Local store

A component-scoped store can act as a local state persistent across remounts and as an unmount-safe storage for async data.

```jsx
import {useEffect} from 'react';
import {useStore, Store} from '@axtk/react-store';

const itemStore = new Store();

const Item = ({id}) => {
    useStore(itemStore);

    useEffect(() => {
        if (itemStore.get(id)) return;

        itemStore.set(id, {loading: true});

        fetch(`/items/${id}`)
            .then(res => res.json())
            .then(data => itemStore.set(id, {data, loading: false}));
        // If the request completes after the component has unmounted
        // the fetched data will be safely put into `itemStore` to be
        // reused when/if the component remounts.
    }, [itemStore]);

    let {data, loading} = itemStore.get(id) || {};

    // Rendering
};

export default Item;
```

## Fine-tuning re-renders

By default, each store update will request a re-render of the component subscribed to the particular store, which is then optimized by the React's virtual DOM reconciliation algorithm before affecting the real DOM (and this can be sufficient in many cases). The function passed to the `useStore` hook can prevent the component from a particular re-render at an even earlier stage if its returned value hasn't changed.

```js
const store = useStore(store => store.get([taskId, 'timestamp']));
// In this example, a store update won't request a re-render if the
// timestamp of the specific task hasn't changed.
```

```js
const store = useStore(null);
// With `null` as an argument, the store updates won't cause any
// component re-renders.
```

```js
// In a multi-store setup, the first argument still specifies the store
// key, and the optional second argument controls the re-renders.
const taskStore = useStore('TaskStore', store => {
    return store.get([taskId, 'timestamp']);
});
```

## `Store` and `ImmutableStore`

In this package, stores are represented by two classes: `Store` and `ImmutableStore`. Both classes have nearly identical APIs, and both of them can be used interchangeably in the examples discussed here.

`Store` is a lightweight store that stores data chunks as they are in a mutable internal state, which implies that data chunks that have been passed to the store methods or retrieved from them should be handled as read-only to avoid changes in the store state without notifying its listeners.

`ImmutableStore` is a less lightweight store that maintains immutability of its internal state, receives and returns mutation-safe data chunks, and performs additional data processing under the hood for that purpose.

By default, the `useStore` hook doesn't internally rely on the immutability of the store state, which allows for the use of the `Store` class in many typical cases.

&rarr; *[Store API](https://github.com/axtk/store/blob/master/README.md#store-api)*

## Also

- *[@axtk/store](https://github.com/axtk/store)*, the store classes without React
