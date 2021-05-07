[![npm](https://img.shields.io/npm/v/@axtk/react-store?labelColor=royalblue&color=royalblue&style=flat-square)](https://www.npmjs.com/package/@axtk/react-store) ![browser](https://img.shields.io/badge/browser-✓-345?labelColor=345&color=345&style=flat-square) [![SSR](https://img.shields.io/badge/SSR-✓-345?labelColor=345&color=345&style=flat-square)](#server-side-rendering-ssr) ![TypeScript](https://img.shields.io/badge/TypeScript-✓-345?labelColor=345&color=345&style=flat-square)

# @axtk/react-store

*Compact shared-state management in vanilla React*

This package provides a way to set up the state shared across multiple components with an easy-to-use React hook.

## Single-store setup

The following example shows that a call to the `useStore` hook introduced below is enough to set up the shared state in a React app. The enhancements covered in the subsequent sections are optional and they can be gradually added later to fulfil other related needs.

The term *store* will stand for an object where the shared state will reside. A call to the `useStore` hook returns the store and subscribes the component to the store to bring it up-to-date whenever the store gets updated.

```jsx
// App.jsx
import {useEffect} from 'react';
import {useStore} from '@axtk/react-store';

export default ({taskId}) => {
    // By calling the `useStore` hook, the component subscribes to
    // updates occuring in the store.
    const store = useStore();
    // The component will safely quit listening to the store updates
    // under the hood when it gets unmounted.

    useEffect(() => {
        // If the required data chunk is already in the store, this
        // effect can be skipped.
        if (store.get(taskId)) return;

        fetch(`/tasks/${taskId}`)
            .then(res => res.json())
            .then(data => store.set(taskId, data));
            // When the `store.set()` method is called the `useStore`
            // hook will cause a re-render which in turn will cause
            // an update in `taskData` (below) as well.
    }, [store]);

    const taskData = store.get(taskId);
    // Unless pre-filled, the store is initially empty and `taskData`
    // is undefined until the above effect completes the request.

    if (!taskData)
        return null;

    return (
        <div class="task">
            <span class="label">{taskData.name}: </span>
            <span class="value">{taskData.status}</span>
        </div>
    );
};
```

In this example, the data chunk fetched within the `useEffect` hook is set to the store making it available to any other component via the `useStore` hook, and this is essentially what the shared state is about.

Since the `useStore` hook subscribes the component to the store updates, it is important to note that the store updates (like the `store.set()` calls) should not occur *unconditionally* in the same render code so as not to push the component into an infinite loop of re-renders. In typical cases, this is not really a concern since the store will need to be updated either if it doesn't contain a certain value yet (like in the example above) or in response to some external action, which implies a condition.

## Pre-filled store

The optional `<StoreProvider>` component allows to pre-fill the store with initial data. The store specified by `<StoreProvider>` is available to all nested components through the `useStore` hook:

```jsx
// index.js
import ReactDOM from 'react-dom';
import {Store, StoreProvider} from '@axtk/react-store';
import App from './App';

const initialState = {
    taskX: {name: 'Task X', status: 'succeeded'}
};

ReactDOM.render(
    <StoreProvider value={new Store(initialState)}>
        <App taskId="taskX"/>
    </StoreProvider>,
    document.querySelector('#app')
);
```

Without `<StoreProvider>`, an initially empty default store is created under the hood. (This allows for the *zero-config setup* where the default shared store can be accessed right away from the `useStore` hook without manually creating a store.)

## Multi-store setup

By default, the `useStore` hook responds to all updates in the store, while the workings of the React's virtual DOM reconciliation algorithm help apply only necessary updates to the real DOM, which provides a decent rendering optimization. Using multiple stores in complex applications, apart from providing the semantic separation of data, helps avoid receiving irrelevant updates in the components at an even earlier stage.

Multiple stores can be passed to the application by means of the `<StoreProvider>` component. Apart from a single store, the `value` prop accepts a key-value map or an array of stores.

```jsx
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

Further on, the provided store can be retrieved by its key (or index) by means of the `useStore` hook:

```jsx
export default ({taskId}) => {
    // With a specific store key, the `useStore` hook will only
    // subscribe to the corresponding store.
    const taskStore = useStore('TaskStore');

    // The rest of the rendering.
};
```

## Custom store-specific hooks

Optionally, to make the code less prone to typos, the store keys can be encapsulated in the custom store-specific hooks which can be further reused throughout the code:

```js
import {useStore} from '@axtk/react-store';
export const useTaskStore = () => useStore('TaskStore');
```

The store keys can also be collected within a dedicated enum or a constant object.

## Optional fine-tuning

For more specific control over the way the `useStore` hook triggers the component re-renders, its optional argument can be used. If the argument is a function, a store update will cause a re-render only if the returned value of this function has changed (this is achieved through the React's [render bailout mechanism](https://reactjs.org/docs/hooks-reference.html#bailing-out-of-a-state-update)). If the argument is set to `null`, the `useStore` hook won't request any re-renders (which can be useful if the component is known to never respond to updates in the store).

```js
// In this setting, a store update will cause a re-render if
// the timestamp of the specific task changes
const store = useStore(store => store.get([taskId, 'timestamp']));
```

In a multi-store setup, the first argument still specifies the store key, and the optional second argument controls the re-renders:

```js
const taskStore = useStore('TaskStore', store => {
    return store.get([taskId, 'timestamp']);
});
```

## Server-side rendering (SSR)

On the server, the stores can be pre-filled and passed to `<StoreProvider>` in essentially the same way as in the client-side code:

```jsx
// On the Express server
app.get('/', prefetchAppData, (req, res) => {
    // The store is filled with the data previously fetched and put
    // into the request `req` object in the `prefetchAppData` middleware
    const html = ReactDOMServer.renderToString(
        <StoreProvider value={new Store(req.prefetchedAppData)}>
            <App/>
        </StoreProvider>
    );

    // The prefetched data will be passed to the browser in a global
    // variable that will be used to pre-fill the client-side store.
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

When the application is rendered in the browser, the browser store instance can be filled with the serialized data to match the rendered state:

```jsx
// On the client
ReactDOM.hydrate(
    <StoreProvider value={new Store(window._prefetchedAppData)}>
        <App/>
    </StoreProvider>,
    document.querySelector('#app')
);
```

On the server, the `StoreProvider`'s `value` prop can also be a single store, a key-value map of stores, or an array of stores.

Since the default store in the setting *without* `<StoreProvider>` is imported and initialized once when the app starts, on the server this may cause updates of the default store to persist across requests which might be undesired. To avoid this, the server code should explicitly specify store instances with the `<StoreProvider>` component for each request (as in the example above). (This is not an issue on the client side, since each page load in the browser restarts the client app and the default store is re-initialized.)

## Local stores for async and persistent state

Since the `useStore` hook also accepts standalone instances of the `Store` class (not necessarily coming from a `<StoreProvider>`), a store instance created specifically for a component can be passed to the hook to be further used as an unmount-safe and remount-persistent storage for asynchronously fetched data intended for local use.

```jsx
// A locally created store can act as a kind of the component's local
// state persistent across remounts.
const itemStore = new Store();

const Item = ({id}) => {
    useStore(itemStore);

    useEffect(() => {
        if (itemStore.get(id)) return;

        itemStore.set(id, {loading: true});

        // Fetching and pushing async data to `itemStore`.
        fetch(`/tasks/${id}`)
            .then(res => res.json())
            .then(data => itemStore.set(id, {data, loading: false}));

        // If the request completes after the component has unmounted
        // the fetched data will be safely put into `itemStore` to be
        // reused when/if the component remounts.

        // (Out of scope of this example, but the effect can certainly
        // be extended with the request error handling.)
    }, [itemStore]);

    let {data, loading} = itemStore.get(id);

    // Rendering the item.
};
```

In addition to the state persistence across component remounts, the store can be further enhanced to maintain state persistence across page reloads by saving the store state to `localStorage` in the store update handler.

```jsx
// The following effect can be inserted in the example above to make
// the component state persistent across page reloads.
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
```

## `Store` and `ImmutableStore`

In this package, stores are represented by two classes: `Store` and `ImmutableStore`. Both classes have nearly identical APIs, and both of them can be used interchangeably in the examples discussed here.

`Store` is a lightweight store that stores data chunks as they are in a mutable internal state, which implies that data chunks that have been passed to the store methods or retrieved from them should be handled as read-only to avoid changes in the store state without notifying its listeners.

`ImmutableStore` is a less lightweight store that maintains immutability of its internal state, receives and returns mutation-safe data chunks, and performs additional data processing under the hood for that purpose.

By default, the `useStore` hook doesn't internally rely on the immutability of the store state, which allows for the use of the `Store` class in many typical cases.

&rarr; *[Store API](https://github.com/axtk/store/blob/master/README.md#store-api)*

## Also

- *[@axtk/store](https://github.com/axtk/store)*, the store classes without React
