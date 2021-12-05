[![npm](https://img.shields.io/npm/v/@axtk/react-store?labelColor=royalblue&color=royalblue&style=flat-square)](https://www.npmjs.com/package/@axtk/react-store) [![GitHub](https://img.shields.io/badge/-GitHub-royalblue?labelColor=royalblue&color=royalblue&style=flat-square&logo=github)](https://github.com/axtk/react-store) ![browser](https://img.shields.io/badge/browser-✓-345?labelColor=345&color=345&style=flat-square) [![SSR](https://img.shields.io/badge/SSR-✓-345?labelColor=345&color=345&style=flat-square)](#server-side-rendering-ssr) ![TypeScript](https://img.shields.io/badge/TypeScript-✓-345?labelColor=345&color=345&style=flat-square)

# @axtk/react-store

*Compact shared-state management in React*

Taking inspiration from the easiness of using local state with the `useState` hook.

## Usage example

This package provides the `Store` class and the `useStoreListener` hook. The `Store` class is a container for shared data that allows for subscription to its updates, and the `useStoreListener` hook makes these subscriptions from within React components. The sharing of the stores across components is performed by means of React's Context in a pretty straightforward manner, as shown in the example below.

```jsx
import {createContext, useContext} from 'react';
import ReactDOM from 'react-dom';
import {Store, useStoreListener} from '@axtk/react-store';

// Creating a React's Context for the store that will be furnished
// with a store in a `StoreContext.Provider` component below.
const StoreContext = createContext();

// Wrapping up a hook that picks the store from the Context
// and makes a subscription to the store updates.
const useStore = () => {
    const store = useContext(StoreContext);
    useStoreListener(store);
    return store;
};

// Both `IncrementButton` and `Display` below subscribe to the same
// store and thus share the value of `n` contained in the store.

const IncrementButton = () => {
    const store = useStore();

    return (
        <button onClick={
            () => store.set('n', store.get('n') + 1)
        }>
            Increment
        </button>
    );
};

const Display = () => {
    const store = useStore();

    return <span>{store.get('n')}</span>;
};

const App = () => <div><IncrementButton/> <Display/></div>;

ReactDOM.render(
    // Initializing the store context with a store.
    // The constructor of the Store class accepts an (optional)
    // initial state.
    <StoreContext.Provider value={new Store({n: 42})}>
        <App/>
    </StoreContext.Provider>,
    document.querySelector('#app')
);
```

This example covers much of what is needed to deal with a store in a React app, although there are in fact another couple of [methods](https://github.com/axtk/store/blob/master/README.md#store-api) in the Store API.

From the context's perspective, the store as a data container never changes after it has been initialized concealing its updates under the hood. All interactions with the shared context data are left to the store itself, without the need to come up with additional utility functions to mutate the data in order to trigger a component update.

## Multi-store setup

The shape of a React's context can be virtually anything. It means a single context can accommodate several stores. The task is still to pick the store from the context and to subscribe to its updates by means of the `useStoreListener` hook.

Having multiple stores can help to convey the semantic separation of data in the application and to avoid component subscriptions to updates of irrelevant chunks of data.

```jsx
import {createContext, useContext} from 'react';
import ReactDOM from 'react-dom';
import {Store, useStoreListener} from '@axtk/react-store';

const StoreContext = createContext({});

const useTaskStore = () => {
    const {taskStore} = useContext(StoreContext);
    useStoreListener(taskStore);
    return taskStore;
};

const Task = ({id}) => {
    const taskStore = useTaskStore();
    // ...
};

const App = () => {
    // ...
};

ReactDOM.render(
    <StoreContext.Provider value={{
        taskStore: new Store(),
        userStore: new Store()
    }}>
        <App/>
    </StoreContext.Provider>,
    document.querySelector('#app')
);
```

## Server-side rendering (SSR)

On the server, the stores can be pre-filled and passed to a React's Context in essentially the same way as in the client-side code.

```jsx
// On an Express server
app.get('/', prefetchAppData, (req, res) => {
    const html = ReactDOMServer.renderToString(
        <StoreContext.Provider value={new Store(req.prefetchedAppData)}>
            <App/>
        </StoreContext.Provider>
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
    <StoreContext.Provider value={new Store(window._prefetchedAppData)}>
        <App/>
    </StoreContext.Provider>,
    document.querySelector('#app')
);
```

## Local store

A component-scoped store can act as a local state persistent across remounts and as an unmount-safe storage for async data.

```jsx
import {useEffect} from 'react';
import {Store, useStoreListener} from '@axtk/react-store';

const itemStore = new Store();

const Item = ({id}) => {
    useStoreListener(itemStore);

    useEffect(() => {
        if (itemStore.get(id)) return;

        itemStore.set(id, {loading: true});

        fetch(`/items/${id}`)
            .then(res => res.json())
            .then(data => itemStore.set(id, {data, loading: false}));
        // If the request completes after the component has unmounted
        // the fetched data will be safely put into `itemStore` to be
        // reused when/if the component remounts.

        // Data fetching error handling was not added to this example
        // only for the sake of focusing on the interaction with the
        // store.
    }, [itemStore]);

    let {data, loading} = itemStore.get(id) || {};

    // Rendering
};

export default Item;
```

## Optional fine-tuning

By default, each store update will request a re-render of the component subscribed to the particular store, which is then optimized by React under the hood with its virtual DOM reconciliation algorithm before affecting the real DOM (and this can be sufficient in many cases). The function passed to the `useStoreListener` hook as the optional second parameter can prevent the component from a particular re-render at an even earlier stage if its returned value hasn't changed.

```js
useStoreListener(store, store => store.get([taskId, 'timestamp']));
// In this example, a store update won't request a re-render if the
// timestamp of the specific task hasn't changed.
```

```js
useStoreListener(store, null);
// With `null` as the second argument, the store updates won't cause
// any component re-renders.
```

The optional third parameter allows to specify the value equality function used to figure out whether the update trigger value has changed. By default, it is `Object.is`.

```js
useStoreListener(
    store,
    store => store.get([taskId, 'timestamp']),
    (prev, next) => next - prev < 1000
);
// In this example, a store update won't request a re-render if the
// timestamp of the specific task has increased by less than a
// second compared to the previous timestamp value.
```

## Also

- *[@axtk/store](https://github.com/axtk/store)*, the `Store` class without React
