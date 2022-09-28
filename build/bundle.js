
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.50.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    let categories = [
        "All",
        "Rank",
        "Industry",
        "Pre-Rank",
        "Re-Rank",
        "Match",
        "Multi-Task",
        "Multi-Modal",
        "Multi-Scenario",
        "Debias",
        "Calibration",
        "Distillation",
        "Feedback-Delay",
        "ContrastiveLearning",
        "Cold-Start",
        "Learning-to-Rank",
        "Fairness",
        "Look-Alike",
        "CausalInference",
        "Diversity",
        "ABTest",
        "Reinforce"
    ];

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.50.1 */

    function create_fragment$7(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $location;
    	let $routes;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, 'routes');
    	component_subscribe($$self, routes, value => $$invalidate(6, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(5, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(7, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ['basepath', 'url'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$location,
    		$routes,
    		$base
    	});

    	$$self.$inject_state = $$props => {
    		if ('basepath' in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 128) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			{
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 96) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			{
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		$location,
    		$routes,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.50.1 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 4,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[2],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, routeParams, $location*/ 532)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[2],
    		/*routeProps*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
    					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, 'activeRoute');
    	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('path' in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate(8, path = $$new_props.path);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('routeParams' in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
    		if ('routeProps' in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
    			if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(2, routeParams = $activeRoute.params);
    			}
    		}

    		{
    			const { path, component, ...rest } = $$props;
    			$$invalidate(3, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		$activeRoute,
    		routeParams,
    		routeProps,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.50.1 */
    const file$5 = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$5(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1],
    		/*$$restProps*/ ctx[6]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file$5, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1],
    				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let ariaCurrent;
    	const omit_props_names = ["to","replace","state","getProps"];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let $location;
    	let $base;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, 'base');
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, 'location');
    	component_subscribe($$self, location, value => $$invalidate(13, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ('to' in $$new_props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$new_props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$new_props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		ariaCurrent,
    		$location,
    		$base
    	});

    	$$self.$inject_state = $$new_props => {
    		if ('to' in $$props) $$invalidate(7, to = $$new_props.to);
    		if ('replace' in $$props) $$invalidate(8, replace = $$new_props.replace);
    		if ('state' in $$props) $$invalidate(9, state = $$new_props.state);
    		if ('getProps' in $$props) $$invalidate(10, getProps = $$new_props.getProps);
    		if ('href' in $$props) $$invalidate(0, href = $$new_props.href);
    		if ('isPartiallyCurrent' in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
    		if ('isCurrent' in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
    		if ('props' in $$props) $$invalidate(1, props = $$new_props.props);
    		if ('ariaCurrent' in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16512) {
    			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 8193) {
    			$$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 8193) {
    			$$invalidate(12, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
    			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 15361) {
    			$$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		$$restProps,
    		to,
    		replace,
    		state,
    		getProps,
    		isPartiallyCurrent,
    		isCurrent,
    		$location,
    		$base,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			to: 7,
    			replace: 8,
    			state: 9,
    			getProps: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\lib\Menu.svelte generated by Svelte v3.50.1 */
    const file$4 = "src\\lib\\Menu.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (12:10) <Link to="/">
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Main");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(12:10) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (13:10) <Link to="/">
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Search");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(13:10) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (20:16) <Link to="category/{cat}">
    function create_default_slot_1$1(ctx) {
    	let t_value = /*cat*/ ctx[0] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(20:16) <Link to=\\\"category/{cat}\\\">",
    		ctx
    	});

    	return block;
    }

    // (19:8) {#each categories as cat}
    function create_each_block$2(ctx) {
    	let li;
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: "category/" + /*cat*/ ctx[0],
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(link.$$.fragment);
    			add_location(li, file$4, 19, 12, 488);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(link, li, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(19:8) {#each categories as cat}",
    		ctx
    	});

    	return block;
    }

    // (7:4) <Router>
    function create_default_slot$1(ctx) {
    	let p0;
    	let t1;
    	let ul0;
    	let li0;
    	let link0;
    	let t2;
    	let li1;
    	let link1;
    	let t3;
    	let p1;
    	let t5;
    	let ul1;
    	let current;

    	link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value = categories;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			p0.textContent = "General";
    			t1 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			create_component(link0.$$.fragment);
    			t2 = space();
    			li1 = element("li");
    			create_component(link1.$$.fragment);
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "分类索引";
    			t5 = space();
    			ul1 = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p0, "class", "menu-label");
    			add_location(p0, file$4, 7, 4, 191);
    			add_location(li0, file$4, 11, 6, 274);
    			add_location(li1, file$4, 12, 6, 315);
    			attr_dev(ul0, "class", "menu-list");
    			add_location(ul0, file$4, 10, 4, 244);
    			attr_dev(p1, "class", "menu-label");
    			add_location(p1, file$4, 14, 4, 367);
    			attr_dev(ul1, "class", "menu-list");
    			add_location(ul1, file$4, 17, 4, 417);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, ul0, anchor);
    			append_dev(ul0, li0);
    			mount_component(link0, li0, null);
    			append_dev(ul0, t2);
    			append_dev(ul0, li1);
    			mount_component(link1, li1, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, ul1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);

    			if (dirty & /*categories*/ 0) {
    				each_value = categories;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(ul0);
    			destroy_component(link0);
    			destroy_component(link1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(ul1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(7:4) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let aside;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			create_component(router.$$.fragment);
    			attr_dev(aside, "class", "menu column is-one-quarter");
    			add_location(aside, file$4, 5, 0, 129);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			mount_component(router, aside, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ categories, Router, Link, Route });
    	return [];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\lib\PaperCard.svelte generated by Svelte v3.50.1 */

    const file$3 = "src\\lib\\PaperCard.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (17:16) {#each tagArray as tag}
    function create_each_block_1(ctx) {
    	let span;
    	let t0;
    	let t1_value = /*tag*/ ctx[10] + "";
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("#");
    			t1 = text(t1_value);
    			attr_dev(span, "class", "tag is-info");
    			add_location(span, file$3, 17, 20, 620);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tagArray*/ 4 && t1_value !== (t1_value = /*tag*/ ctx[10] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(17:16) {#each tagArray as tag}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#each authorArray as author}
    function create_each_block$1(ctx) {
    	let t0_value = /*author*/ ctx[7] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text("; ");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*authorArray*/ 32 && t0_value !== (t0_value = /*author*/ ctx[7] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(23:16) {#each authorArray as author}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let p0;
    	let a0;
    	let strong0;
    	let t0;
    	let t1;
    	let br;
    	let t2;
    	let div0;
    	let strong1;
    	let t4;
    	let t5;
    	let p1;
    	let strong2;
    	let t7;
    	let t8;
    	let t9;
    	let p2;
    	let t10;
    	let p3;
    	let a1;
    	let t11;
    	let t12;
    	let time;
    	let t13;
    	let each_value_1 = /*tagArray*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*authorArray*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			a0 = element("a");
    			strong0 = element("strong");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			div0 = element("div");
    			strong1 = element("strong");
    			strong1.textContent = "标签";
    			t4 = text("：\r\n                ");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();
    			p1 = element("p");
    			strong2 = element("strong");
    			strong2.textContent = "类目";
    			t7 = text(": ");
    			t8 = text(/*category*/ ctx[3]);
    			t9 = space();
    			p2 = element("p");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			p3 = element("p");
    			a1 = element("a");
    			t11 = text(/*company*/ ctx[6]);
    			t12 = text(", ");
    			time = element("time");
    			t13 = text(/*year*/ ctx[4]);
    			add_location(strong0, file$3, 13, 31, 456);
    			attr_dev(a0, "href", /*url*/ ctx[1]);
    			add_location(a0, file$3, 13, 15, 440);
    			add_location(p0, file$3, 13, 12, 437);
    			add_location(br, file$3, 14, 12, 501);
    			add_location(strong1, file$3, 15, 30, 537);
    			attr_dev(div0, "class", "tags");
    			add_location(div0, file$3, 15, 12, 519);
    			add_location(strong2, file$3, 20, 15, 721);
    			add_location(p1, file$3, 20, 12, 718);
    			set_style(p2, "text-align", "right");
    			add_location(p2, file$3, 21, 12, 770);
    			attr_dev(a1, "href", "#/");
    			add_location(a1, file$3, 26, 42, 968);
    			attr_dev(time, "datetime", /*year*/ ctx[4]);
    			add_location(time, file$3, 26, 70, 996);
    			set_style(p3, "text-align", "right");
    			add_location(p3, file$3, 26, 12, 938);
    			attr_dev(div1, "class", "content");
    			add_location(div1, file$3, 12, 8, 402);
    			attr_dev(div2, "class", "card-content");
    			add_location(div2, file$3, 11, 4, 366);
    			attr_dev(div3, "class", "card are-fullwidth");
    			add_location(div3, file$3, 10, 0, 328);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, a0);
    			append_dev(a0, strong0);
    			append_dev(strong0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, br);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, strong1);
    			append_dev(div0, t4);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, strong2);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(div1, t9);
    			append_dev(div1, p2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p2, null);
    			}

    			append_dev(div1, t10);
    			append_dev(div1, p3);
    			append_dev(p3, a1);
    			append_dev(a1, t11);
    			append_dev(p3, t12);
    			append_dev(p3, time);
    			append_dev(time, t13);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);

    			if (dirty & /*url*/ 2) {
    				attr_dev(a0, "href", /*url*/ ctx[1]);
    			}

    			if (dirty & /*tagArray*/ 4) {
    				each_value_1 = /*tagArray*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*category*/ 8) set_data_dev(t8, /*category*/ ctx[3]);

    			if (dirty & /*authorArray*/ 32) {
    				each_value = /*authorArray*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*company*/ 64) set_data_dev(t11, /*company*/ ctx[6]);
    			if (dirty & /*year*/ 16) set_data_dev(t13, /*year*/ ctx[4]);

    			if (dirty & /*year*/ 16) {
    				attr_dev(time, "datetime", /*year*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PaperCard', slots, []);
    	let { name = "Example PDF Name" } = $$props;
    	let { url = "https://download.me.com" } = $$props;
    	let { tagArray = ["test", "test1"] } = $$props;
    	let { category = "Rank" } = $$props;
    	let { year = "2003" } = $$props;
    	let { authorArray = ["Huang Baochen", "Tang Mengjie"] } = $$props;
    	let { company = "Aliyeye" } = $$props;
    	const writable_props = ['name', 'url', 'tagArray', 'category', 'year', 'authorArray', 'company'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PaperCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('url' in $$props) $$invalidate(1, url = $$props.url);
    		if ('tagArray' in $$props) $$invalidate(2, tagArray = $$props.tagArray);
    		if ('category' in $$props) $$invalidate(3, category = $$props.category);
    		if ('year' in $$props) $$invalidate(4, year = $$props.year);
    		if ('authorArray' in $$props) $$invalidate(5, authorArray = $$props.authorArray);
    		if ('company' in $$props) $$invalidate(6, company = $$props.company);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		url,
    		tagArray,
    		category,
    		year,
    		authorArray,
    		company
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('url' in $$props) $$invalidate(1, url = $$props.url);
    		if ('tagArray' in $$props) $$invalidate(2, tagArray = $$props.tagArray);
    		if ('category' in $$props) $$invalidate(3, category = $$props.category);
    		if ('year' in $$props) $$invalidate(4, year = $$props.year);
    		if ('authorArray' in $$props) $$invalidate(5, authorArray = $$props.authorArray);
    		if ('company' in $$props) $$invalidate(6, company = $$props.company);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, url, tagArray, category, year, authorArray, company];
    }

    class PaperCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			name: 0,
    			url: 1,
    			tagArray: 2,
    			category: 3,
    			year: 4,
    			authorArray: 5,
    			company: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PaperCard",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get name() {
    		throw new Error("<PaperCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<PaperCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<PaperCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<PaperCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tagArray() {
    		throw new Error("<PaperCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tagArray(value) {
    		throw new Error("<PaperCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get category() {
    		throw new Error("<PaperCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set category(value) {
    		throw new Error("<PaperCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get year() {
    		throw new Error("<PaperCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set year(value) {
    		throw new Error("<PaperCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get authorArray() {
    		throw new Error("<PaperCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set authorArray(value) {
    		throw new Error("<PaperCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get company() {
    		throw new Error("<PaperCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set company(value) {
    		throw new Error("<PaperCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var papers = [{tag:["ABTest"],name:"Overlapping Experiment Infrastructure - More, Better, Faster Experimentation",category:"ABTest",authors:["Diane Tang","Ashish Agarwal","Deirdre O'Brein","Mike Meyer"],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ABTest/Overlapping Experiment Infrastructure - More, Better, Faster Experimentation.pdf",year:1900,id:0},{tag:["Calibration"],name:"Attended Temperature Scaling - A Practical Approach for Calibrating Deep Neural Networks",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Attended Temperature Scaling - A Practical Approach for Calibrating Deep Neural Networks.pdf",year:1900,id:1},{tag:["Calibration"],name:"Beta calibration - a well-founded and easily implemented improvement on logistic calibration for binary classifiers",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Beta calibration - a well-founded and easily implemented improvement on logistic calibration for binary classifiers.pdf",year:1900,id:2},{tag:["Calibration"],name:"Beyond temperature scaling - Obtaining well-calibrated multiclass probabilities with Dirichlet calibration",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Beyond temperature scaling - Obtaining well-calibrated multiclass probabilities with Dirichlet calibration.pdf",year:1900,id:3},{tag:["Calibration"],name:"Calibrated Recommendations",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Calibrated Recommendations.pdf",year:1900,id:4},{tag:["Calibration"],name:"Calibrating User Response Predictions in Online Advertising",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Calibrating User Response Predictions in Online Advertising.pdf",year:1900,id:5},{tag:["Calibration"],name:"CALIBRATION OF NEURAL NETWORKS USING SPLINES",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/CALIBRATION OF NEURAL NETWORKS USING SPLINES.pdf",year:1900,id:6},{tag:["Calibration"],name:"Crank up the volume - preference bias amplificationin collaborative recommendation",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Crank up the volume - preference bias amplificationin collaborative recommendation.pdf",year:1900,id:7},{tag:["Calibration"],name:"Distribution-free calibration guarantees for histogram binning without sample splitting",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Distribution-free calibration guarantees for histogram binning without sample splitting.pdf",year:1900,id:8},{tag:["Calibration"],name:"Field-aware Calibration - A Simple and Empirically Strong Method for Reliable Probabilistic Predictions",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Field-aware Calibration - A Simple and Empirically Strong Method for Reliable Probabilistic Predictions.pdf",year:1900,id:9},{tag:["Calibration"],name:"MBCT - Tree-Based Feature-Aware Binning for Individual Uncertainty Calibration",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/MBCT - Tree-Based Feature-Aware Binning for Individual Uncertainty Calibration.pdf",year:1900,id:10},{tag:["Calibration"],name:"Measuring Calibration in Deep Learning",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Measuring Calibration in Deep Learning.pdf",year:1900,id:11},{tag:["Calibration"],name:"Mitigating Bias in Calibration Error Estimation",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Mitigating Bias in Calibration Error Estimation.pdf",year:1900,id:12},{tag:["Calibration"],name:"Obtaining calibrated probability estimates from decision trees and naive Bayesian classifiers",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Obtaining calibrated probability estimates from decision trees and naive Bayesian classifiers.pdf",year:1900,id:13},{tag:["Calibration"],name:"Obtaining Well Calibrated Probabilities Using Bayesian Binning",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Obtaining Well Calibrated Probabilities Using Bayesian Binning.pdf",year:1900,id:14},{tag:["Calibration"],name:"On Calibration of Modern Neural Networks",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/On Calibration of Modern Neural Networks.pdf",year:1900,id:15},{tag:["Calibration"],name:"Posterior Probability Matters - Doubly-Adaptive Calibration for Neural Predictions in Online Advertising",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Posterior Probability Matters - Doubly-Adaptive Calibration for Neural Predictions in Online Advertising.pdf",year:1900,id:16},{tag:["Calibration"],name:"Probabilistic outputs for support vector machines and comparisons to regularized likelihood methods",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Probabilistic outputs for support vector machines and comparisons to regularized likelihood methods.pdf",year:1900,id:17},{tag:["Calibration"],name:"Transforming Classifier Scores into Accurate Multiclass Probability Estimates",category:"Calibration",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Calibration/Transforming Classifier Scores into Accurate Multiclass Probability Estimates.pdf",year:1900,id:18},{tag:["CausalInference"],name:"Causal Inference in Recommender Systems - A Survey and Future Directions",category:"CausalInference",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/CausalInference/Causal Inference in Recommender Systems - A Survey and Future Directions.pdf",year:1900,id:19},{tag:["CausalInference"],name:"CauseRec - Counterfactual User Sequence Synthesis for Sequential Recommendation",category:"CausalInference",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/CausalInference/CauseRec - Counterfactual User Sequence Synthesis for Sequential Recommendation.pdf",year:1900,id:20},{tag:["CausalInference"],name:"Clicks can be Cheating - Counterfactual Recommendation for Mitigating Clickbait Issue",category:"CausalInference",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/CausalInference/Clicks can be Cheating - Counterfactual Recommendation for Mitigating Clickbait Issue.pdf",year:1900,id:21},{tag:["CausalInference"],name:"Counterfactual Data-Augmented Sequential Recommendation",category:"CausalInference",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/CausalInference/Counterfactual Data-Augmented Sequential Recommendation.pdf",year:1900,id:22},{tag:["CausalInference"],name:"Deconfounded Recommendation for Alleviating Bias Amplification",category:"CausalInference",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/CausalInference/Deconfounded Recommendation for Alleviating Bias Amplification.pdf",year:1900,id:23},{tag:["CausalInference"],name:"Doubly Robust Joint Learning for Recommendation on Data Missing Not at Random",category:"CausalInference",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/CausalInference/Doubly Robust Joint Learning for Recommendation on Data Missing Not at Random.pdf",year:1900,id:24},{tag:["CausalInference"],name:"Improving Ad Click Prediction by Considering Non-displayed Events",category:"CausalInference",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/CausalInference/Improving Ad Click Prediction by Considering Non-displayed Events.pdf",year:1900,id:25},{tag:["CausalInference"],name:"Model-Agnostic Counterfactual Reasoning for Eliminating Popularity Bias in Recommender System",category:"CausalInference",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/CausalInference/Model-Agnostic Counterfactual Reasoning for Eliminating Popularity Bias in Recommender System.pdf",year:1900,id:26},{tag:["CausalInference"],name:"Practical Counterfactual Policy Learning for Top-K Recommendations",category:"CausalInference",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/CausalInference/Practical Counterfactual Policy Learning for Top-K Recommendations.pdf",year:1900,id:27},{tag:["CausalInference"],name:"Recommendations as Treatments - Debiasing Learning and Evaluation",category:"CausalInference",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/CausalInference/Recommendations as Treatments - Debiasing Learning and Evaluation.pdf",year:1900,id:28},{tag:["Cold-Start"],name:"A Practical Exploration System for Search Advertising",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/A Practical Exploration System for Search Advertising.pdf",year:1900,id:29},{tag:["Cold-Start"],name:"A Semi-Personalized System for User Cold Start Recommendation on Music Streaming Apps",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/A Semi-Personalized System for User Cold Start Recommendation on Music Streaming Apps.pdf",year:1900,id:30},{tag:["Cold-Start"],name:"Addressing the Item Cold-start Problem by Attribute-driven Active Learning",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Addressing the Item Cold-start Problem by Attribute-driven Active Learning.pdf",year:1900,id:31},{tag:["Cold-Start"],name:"Alleviating Cold-start Problem in CTR Prediction with A Variational Embedding Learning Framework",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Alleviating Cold-start Problem in CTR Prediction with A Variational Embedding Learning Framework.pdf",year:1900,id:32},{tag:["Cold-Start"],name:"Cold-start Sequential Recommendation via Meta Learner",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Cold-start Sequential Recommendation via Meta Learner.pdf",year:1900,id:33},{tag:["Cold-Start"],name:"GIFT - Graph-guIded Feature Transfer for Cold-Start Video Click-Through Rate Prediction",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/GIFT - Graph-guIded Feature Transfer for Cold-Start Video Click-Through Rate Prediction.pdf",year:1900,id:34},{tag:["Cold-Start"],name:"Handling User Cold Start Problem in Recommender Systems Using Fuzzy Clustering",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Handling User Cold Start Problem in Recommender Systems Using Fuzzy Clustering.pdf",year:1900,id:35},{tag:["Cold-Start"],name:"Learning to Warm Up Cold Item Embeddings for Cold-start Recommendation with Meta Scaling and Shifting Networks",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Learning to Warm Up Cold Item Embeddings for Cold-start Recommendation with Meta Scaling and Shifting Networks.pdf",year:1900,id:36},{tag:["Cold-Start"],name:"MAMO - Memory-Augmented Meta-Optimization for Cold-start Recommendation",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/MAMO - Memory-Augmented Meta-Optimization for Cold-start Recommendation.pdf",year:1900,id:37},{tag:["Cold-Start"],name:"Telepath - Understanding Users from a Human Vision Perspective in Large-Scale Recommender Systems",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Telepath - Understanding Users from a Human Vision Perspective in Large-Scale Recommender Systems.pdf",year:1900,id:38},{tag:["Cold-Start"],name:"Transform Cold-Start Users into Warm via Fused Behaviors in Large-Scale Recommendation",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Transform Cold-Start Users into Warm via Fused Behaviors in Large-Scale Recommendation.pdf",year:1900,id:39},{tag:["Cold-Start"],name:"Warm Up Cold-start Advertisements - Improving CTR Predictions via Learning to Learn ID Embeddings",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Warm Up Cold-start Advertisements - Improving CTR Predictions via Learning to Learn ID Embeddings.pdf",year:1900,id:40},{tag:["Cold-Start"],name:"[2017][DropoutNet] DropoutNet - Addressing Cold Start in Recommender Systems",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/[2017][DropoutNet] DropoutNet - Addressing Cold Start in Recommender Systems.pdf",year:2017,id:41},{tag:["Cold-Start"],name:"[2017][HIN] Heterogeneous Information Network Embedding for Recommendation",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/[2017][HIN] Heterogeneous Information Network Embedding for Recommendation.pdf",year:2017,id:42},{tag:["Cold-Start","MAML"],name:"[2017][MAML]Model-Agnostic Meta-Learning for Fast Adaptation of Deep Networks",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/[2017][MAML]Model-Agnostic Meta-Learning for Fast Adaptation of Deep Networks.pdf",year:2017,id:43},{tag:["Cold-Start","ICAN"],name:"[2020][Wechat][ICAN] Internal and Contextual Attention Network for Cold-start Multi-channel Matching in Recommendation",category:"Cold-Start",authors:[],company:"Wechat",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/[2020][Wechat][ICAN] Internal and Contextual Attention Network for Cold-start Multi-channel Matching in Recommendation.pdf",year:2020,id:44},{tag:["Cold-Start","POSO"],name:"[2021][Kuaishou][POSO] POSO - Personalized Cold Start Modules for Large-scale Recommender Systems",category:"Cold-Start",authors:[],company:"Kuaishou",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/[2021][Kuaishou][POSO] POSO - Personalized Cold Start Modules for Large-scale Recommender Systems.pdf",year:2021,id:45},{tag:["ContrastiveLearning"],name:"A Simple Framework for Contrastive Learning of Visual Representations",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/A Simple Framework for Contrastive Learning of Visual Representations.pdf",year:1900,id:46},{tag:["ContrastiveLearning"],name:"An Empirical Study of Training Self-Supervised Vision Transformers",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/An Empirical Study of Training Self-Supervised Vision Transformers.pdf",year:1900,id:47},{tag:["ContrastiveLearning"],name:"Bootstrap Your Own Latent A New Approach to Self-Supervised Learning",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Bootstrap Your Own Latent A New Approach to Self-Supervised Learning.pdf",year:1900,id:48},{tag:["ContrastiveLearning"],name:"CCL4Rec - Contrast over Contrastive Learning for Micro-video Recommendation",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/CCL4Rec - Contrast over Contrastive Learning for Micro-video Recommendation.pdf",year:1900,id:49},{tag:["ContrastiveLearning"],name:"Contrastive Learning for Debiased Candidate Generation in Large-Scale Recommender Systems",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Contrastive Learning for Debiased Candidate Generation in Large-Scale Recommender Systems.pdf",year:1900,id:50},{tag:["ContrastiveLearning"],name:"Contrastive Learning for Interactive Recommendation in Fashion",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Contrastive Learning for Interactive Recommendation in Fashion.pdf",year:1900,id:51},{tag:["ContrastiveLearning"],name:"Disentangled Contrastive Learning for Social Recommendation",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Disentangled Contrastive Learning for Social Recommendation.pdf",year:1900,id:52},{tag:["ContrastiveLearning"],name:"Exploiting Negative Preference in Content-based Music Recommendation with Contrastive Learning",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Exploiting Negative Preference in Content-based Music Recommendation with Contrastive Learning.pdf",year:1900,id:53},{tag:["ContrastiveLearning"],name:"Improved Baselines with Momentum Contrastive Learning",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Improved Baselines with Momentum Contrastive Learning.pdf",year:1900,id:54},{tag:["ContrastiveLearning"],name:"Improving Knowledge-aware Recommendation with Multi-level Interactive Contrastive Learning",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Improving Knowledge-aware Recommendation with Multi-level Interactive Contrastive Learning.pdf",year:1900,id:55},{tag:["ContrastiveLearning"],name:"Momentum Contrast for Unsupervised Visual Representation Learning",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Momentum Contrast for Unsupervised Visual Representation Learning.pdf",year:1900,id:56},{tag:["ContrastiveLearning"],name:"Multi-level Contrastive Learning Framework for Sequential Recommendation",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Multi-level Contrastive Learning Framework for Sequential Recommendation.pdf",year:1900,id:57},{tag:["ContrastiveLearning"],name:"Multi-view Multi-behavior Contrastive Learning in Recommendation",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Multi-view Multi-behavior Contrastive Learning in Recommendation.pdf",year:1900,id:58},{tag:["ContrastiveLearning"],name:"Predictive and Contrastive- Dual-Auxiliary Learning for Recommendation",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Predictive and Contrastive- Dual-Auxiliary Learning for Recommendation.pdf",year:1900,id:59},{tag:["ContrastiveLearning"],name:"Understanding Contrastive Representation Learning through Alignment and Uniformity on the Hypersphere",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Understanding Contrastive Representation Learning through Alignment and Uniformity on the Hypersphere.pdf",year:1900,id:60},{tag:["ContrastiveLearning"],name:"Understanding the Behaviour of Contrastive Loss",category:"ContrastiveLearning",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/ContrastiveLearning/Understanding the Behaviour of Contrastive Loss.pdf",year:1900,id:61},{tag:["Debias"],name:"AutoDebias - Learning to Debias for Recommendation",category:"Debias",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Debias/AutoDebias - Learning to Debias for Recommendation.pdf",year:1900,id:62},{tag:["Debias"],name:"Bias and Debias in Recommender System A Survey and Future Directions",category:"Debias",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Debias/Bias and Debias in Recommender System A Survey and Future Directions.pdf",year:1900,id:63},{tag:["Debias"],name:"Deep Position-wise Interaction Network for CTR Prediction",category:"Debias",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Debias/Deep Position-wise Interaction Network for CTR Prediction.pdf",year:1900,id:64},{tag:["Debias"],name:"Denoising Implicit Feedback for Recommendation",category:"Debias",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Debias/Denoising Implicit Feedback for Recommendation.pdf",year:1900,id:65},{tag:["Debias"],name:"DVR - Micro-Video Recommendation Optimizing Watch-Time-Gain under Duration Bias",category:"Debias",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Debias/DVR - Micro-Video Recommendation Optimizing Watch-Time-Gain under Duration Bias.pdf",year:1900,id:66},{tag:["Debias"],name:"Improving Micro-video Recommendation by Controlling Position Bias",category:"Debias",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Debias/Improving Micro-video Recommendation by Controlling Position Bias.pdf",year:1900,id:67},{tag:["Debias"],name:"Learning to rank with selection bias in personal search",category:"Debias",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Debias/Learning to rank with selection bias in personal search.pdf",year:1900,id:68},{tag:["Debias"],name:"Unbiased Learning-to-Rank with Biased Feedback",category:"Debias",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Debias/Unbiased Learning-to-Rank with Biased Feedback.pdf",year:1900,id:69},{tag:["Debias","PAL"],name:"[2019][Huawei][PAL] a position-bias aware learning framework for CTR prediction in live recommender systems",category:"Debias",authors:["Huifeng Guo","Ruiming Tang"],company:"Huawei",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Debias/[2019][Huawei][PAL] a position-bias aware learning framework for CTR prediction in live recommender systems.pdf",year:2019,id:70},{tag:["Distillation"],name:"Ensembled CTR Prediction via Knowledge Distillation",category:"Distillation",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Distillation/Ensembled CTR Prediction via Knowledge Distillation.pdf",year:1900,id:71},{tag:["Distillation"],name:"Privileged Features Distillation at Taobao Recommendations",category:"Distillation",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Distillation/Privileged Features Distillation at Taobao Recommendations.pdf",year:1900,id:72},{tag:["Distillation"],name:"Ranking Distillation - Learning Compact Ranking Models With High Performance for Recommender System",category:"Distillation",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Distillation/Ranking Distillation - Learning Compact Ranking Models With High Performance for Recommender System.pdf",year:1900,id:73},{tag:["Distillation"],name:"Rocket Launching - A Universal and Efficient Framework for Training Well-performing Light Net",category:"Distillation",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Distillation/Rocket Launching - A Universal and Efficient Framework for Training Well-performing Light Net.pdf",year:1900,id:74},{tag:["Distillation","DMTL"],name:"[2021][Tencent][DMTL] Distillation based Multi-task Learning - A Candidate Generation Model for Improving Reading Duration",category:"Distillation",authors:[],company:"Tencent",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Distillation/[2021][Tencent][DMTL] Distillation based Multi-task Learning - A Candidate Generation Model for Improving Reading Duration.pdf",year:2021,id:75},{tag:["Diversity"],name:"A Framework for Recommending Accurate and Diverse Items Using Bayesian Graph Convolutional Neural Networks",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/A Framework for Recommending Accurate and Diverse Items Using Bayesian Graph Convolutional Neural Networks.pdf",year:1900,id:76},{tag:["Diversity"],name:"Adaptive, Personalized Diversity for Visual Discovery",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/Adaptive, Personalized Diversity for Visual Discovery.pdf",year:1900,id:77},{tag:["Diversity"],name:"DGCN - Diversified Recommendation with Graph Convolutional Networks",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/DGCN - Diversified Recommendation with Graph Convolutional Networks.pdf",year:1900,id:78},{tag:["Diversity"],name:"Diversifying Search Results",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/Diversifying Search Results.pdf",year:1900,id:79},{tag:["Diversity"],name:"Diversity on the Go! Streaming Determinantal Point Processes under a Maximum Induced Cardinality Objective",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/Diversity on the Go! Streaming Determinantal Point Processes under a Maximum Induced Cardinality Objective.pdf",year:1900,id:80},{tag:["Diversity"],name:"Enhancing Domain-Level and User-Level Adaptivity in Diversified Recommendation",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/Enhancing Domain-Level and User-Level Adaptivity in Diversified Recommendation.pdf",year:1900,id:81},{tag:["Diversity"],name:"Enhancing Recommendation Diversity using Determinantal Point Processes on Knowledge Graphs",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/Enhancing Recommendation Diversity using Determinantal Point Processes on Knowledge Graphs.pdf",year:1900,id:82},{tag:["Diversity"],name:"Exploiting Query Reformulations for Web Search Result Diversification",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/Exploiting Query Reformulations for Web Search Result Diversification.pdf",year:1900,id:83},{tag:["Diversity"],name:"Feature-aware Diversified Re-ranking with Disentangled Representations for Relevant Recommendation",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/Feature-aware Diversified Re-ranking with Disentangled Representations for Relevant Recommendation.pdf",year:1900,id:84},{tag:["Diversity"],name:"Future-Aware Diverse Trends Framework for Recommendation",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/Future-Aware Diverse Trends Framework for Recommendation.pdf",year:1900,id:85},{tag:["Diversity"],name:"Improving Recommendation Lists Through Topic Diversification",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/Improving Recommendation Lists Through Topic Diversification.pdf",year:1900,id:86},{tag:["Diversity"],name:"Managing Diversity in Airbnb Search",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/Managing Diversity in Airbnb Search.pdf",year:1900,id:87},{tag:["Diversity"],name:"Novelty and Diversity in Information Retrieval Evaluation",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/Novelty and Diversity in Information Retrieval Evaluation.pdf",year:1900,id:88},{tag:["Diversity"],name:"P-Companion - A Principled Framework for Diversified Complementary Product Recommendation",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/P-Companion - A Principled Framework for Diversified Complementary Product Recommendation.pdf",year:1900,id:89},{tag:["Diversity"],name:"UNDERSTANDING DIVERSITY IN SESSION-BASED RECOMMENDATION",category:"Diversity",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/UNDERSTANDING DIVERSITY IN SESSION-BASED RECOMMENDATION.pdf",year:1900,id:90},{tag:["Diversity","pDPP"],name:"[2020][Huawei][pDPP] Personalized Re-ranking for Improving Diversity in Live Recommender Systems",category:"Diversity",authors:[],company:"Huawei",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Diversity/[2020][Huawei][pDPP] Personalized Re-ranking for Improving Diversity in Live Recommender Systems.pdf",year:2020,id:91},{tag:["Fairness","FairCo"],name:"[2020][FairCo] Controlling Fairness and Bias in Dynamic Learning-to-Rank",category:"Fairness",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Fairness/[2020][FairCo] Controlling Fairness and Bias in Dynamic Learning-to-Rank.pdf",year:2020,id:92},{tag:["Feedback-Delay"],name:"A Feedback Shift Correction in Predicting Conversion Rates under Delayed Feedback",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/A Feedback Shift Correction in Predicting Conversion Rates under Delayed Feedback.pdf",year:1900,id:93},{tag:["Feedback-Delay"],name:"A Nonparametric Delayed Feedback Model for Conversion Rate Prediction",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/A Nonparametric Delayed Feedback Model for Conversion Rate Prediction.pdf",year:1900,id:94},{tag:["Feedback-Delay"],name:"Addressing Delayed Feedback for Continuous Training with Neural Networks in CTR prediction",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/Addressing Delayed Feedback for Continuous Training with Neural Networks in CTR prediction.pdf",year:1900,id:95},{tag:["Feedback-Delay"],name:"An Attention-based Model for CVR with Delayed Feedback via Post-Click Calibration",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/An Attention-based Model for CVR with Delayed Feedback via Post-Click Calibration.pdf",year:1900,id:96},{tag:["Feedback-Delay"],name:"Asymptotically Unbiased Estimation for Delayed Feedback Modeling via Label Correction",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/Asymptotically Unbiased Estimation for Delayed Feedback Modeling via Label Correction.pdf",year:1900,id:97},{tag:["Feedback-Delay"],name:"Capturing Delayed Feedback in Conversion Rate Predictionvia Elapsed-Time Sampling",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/Capturing Delayed Feedback in Conversion Rate Predictionvia Elapsed-Time Sampling.pdf",year:1900,id:98},{tag:["Feedback-Delay"],name:"Counterfactual Reward Modification for Streaming Recommendation with Delayed Feedback",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/Counterfactual Reward Modification for Streaming Recommendation with Delayed Feedback.pdf",year:1900,id:99},{tag:["Feedback-Delay"],name:"Delayed Feedback Model with Negative Binomial Regression for Multiple Conversions",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/Delayed Feedback Model with Negative Binomial Regression for Multiple Conversions.pdf",year:1900,id:100},{tag:["Feedback-Delay"],name:"Delayed Feedback Modeling for the Entire Space Conversion Rate Prediction",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/Delayed Feedback Modeling for the Entire Space Conversion Rate Prediction.pdf",year:1900,id:101},{tag:["Feedback-Delay"],name:"Dual Learning Algorithm for Delayed Conversions",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/Dual Learning Algorithm for Delayed Conversions.pdf",year:1900,id:102},{tag:["Feedback-Delay"],name:"Handling many conversions per click in modeling delayed feedback",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/Handling many conversions per click in modeling delayed feedback.pdf",year:1900,id:103},{tag:["Feedback-Delay"],name:"Modeling Delayed Feedback in Display Advertising",category:"Feedback-Delay",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/Modeling Delayed Feedback in Display Advertising.pdf",year:1900,id:104},{tag:["Feedback-Delay"],name:"[2021][Alibaba] Real Negatives Matter - Continuous Training with Real Negatives for Delayed Feedback Modeling",category:"Feedback-Delay",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Feedback-Delay/[2021][Alibaba] Real Negatives Matter - Continuous Training with Real Negatives for Delayed Feedback Modeling.pdf",year:2021,id:105},{tag:["Industry"],name:"Adversarial Filtering Modeling on Long-term User Behavior Sequences for Click-Through Rate Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Adversarial Filtering Modeling on Long-term User Behavior Sequences for Click-Through Rate Prediction.pdf",year:1900,id:106},{tag:["Industry"],name:"Adversarial Mixture Of Experts with Category Hierarchy Soft Constraint",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Adversarial Mixture Of Experts with Category Hierarchy Soft Constraint.pdf",year:1900,id:107},{tag:["Industry"],name:"CAEN - A Hierarchically Attentive Evolution Network for Item-Attribute-Change-Aware Recommendation in the Growing E-commerce Environment",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/CAEN - A Hierarchically Attentive Evolution Network for Item-Attribute-Change-Aware Recommendation in the Growing E-commerce Environment.pdf",year:1900,id:108},{tag:["Industry"],name:"CAN - Revisiting Feature Co-Action for Click-Through Rate Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/CAN - Revisiting Feature Co-Action for Click-Through Rate Prediction.pdf",year:1900,id:109},{tag:["Industry"],name:"Category-Specific CNN for Visual-aware CTR Prediction at JD.com",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Category-Specific CNN for Visual-aware CTR Prediction at JD.com.pdf",year:1900,id:110},{tag:["Industry"],name:"ContextNet - A Click-Through Rate Prediction Framework Using Contextual information to Refine Feature Embedding",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/ContextNet - A Click-Through Rate Prediction Framework Using Contextual information to Refine Feature Embedding.pdf",year:1900,id:111},{tag:["Industry"],name:"Curriculum Disentangled Recommendation with Noisy Multi-feedback",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Curriculum Disentangled Recommendation with Noisy Multi-feedback.pdf",year:1900,id:112},{tag:["Industry"],name:"Deep Interest Highlight Network for Click-Through Rate Prediction in Trigger-Induced Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Deep Interest Highlight Network for Click-Through Rate Prediction in Trigger-Induced Recommendation.pdf",year:1900,id:113},{tag:["Industry"],name:"Deep Interest with Hierarchical Attention Network for Click-Through Rate Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Deep Interest with Hierarchical Attention Network for Click-Through Rate Prediction.pdf",year:1900,id:114},{tag:["Industry"],name:"Deep Learning Recommendation Model for Personalization and Recommendation System",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Deep Learning Recommendation Model for Personalization and Recommendation System.pdf",year:1900,id:115},{tag:["Industry"],name:"Deep Spatio-Temporal Neural Networks for Click-Through Rate Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Deep Spatio-Temporal Neural Networks for Click-Through Rate Prediction.pdf",year:1900,id:116},{tag:["Industry"],name:"Denoising Neural Network for News Recommendation with Positive and Negative Implicit Feedback",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Denoising Neural Network for News Recommendation with Positive and Negative Implicit Feedback.pdf",year:1900,id:117},{tag:["Industry"],name:"Denoising User-aware Memory Network for Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Denoising User-aware Memory Network for Recommendation.pdf",year:1900,id:118},{tag:["Industry"],name:"Dual Graph enhanced Embedding Neural Network for CTR Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Dual Graph enhanced Embedding Neural Network for CTR Prediction.pdf",year:1900,id:119},{tag:["Industry"],name:"End-to-End User Behavior Retrieval in Click-Through Rate Prediction Model",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/End-to-End User Behavior Retrieval in Click-Through Rate Prediction Model.pdf",year:1900,id:120},{tag:["Industry"],name:"EXTR - Click-Through Rate Prediction with Externalities in E-Commerce Sponsored Search",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/EXTR - Click-Through Rate Prediction with Externalities in E-Commerce Sponsored Search.pdf",year:1900,id:121},{tag:["Industry"],name:"FeedRec - News Feed Recommendation with Various User Feedbacks",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/FeedRec - News Feed Recommendation with Various User Feedbacks.pdf",year:1900,id:122},{tag:["Industry"],name:"Fi-GNN - Modeling Feature Interactions via Graph Neural Networks for CTR Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Fi-GNN - Modeling Feature Interactions via Graph Neural Networks for CTR Prediction.pdf",year:1900,id:123},{tag:["Industry"],name:"FiBiNet++ - Improving FiBiNet by Greatly Reducing Model Size for CTR Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/FiBiNet++ - Improving FiBiNet by Greatly Reducing Model Size for CTR Prediction.pdf",year:1900,id:124},{tag:["Industry"],name:"FLEN - Leveraging Field for Scalable CTR Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/FLEN - Leveraging Field for Scalable CTR Prediction.pdf",year:1900,id:125},{tag:["Industry"],name:"FM2 - Field-matrixed Factorization Machines for Recommender Systems",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/FM2 - Field-matrixed Factorization Machines for Recommender Systems.pdf",year:1900,id:126},{tag:["Industry"],name:"GateNet - Gating-Enhanced Deep Network for Click-Through Rate Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/GateNet - Gating-Enhanced Deep Network for Click-Through Rate Prediction.pdf",year:1900,id:127},{tag:["Industry"],name:"HIEN - Hierarchical Intention Embedding Network for Click-Through Rate Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/HIEN - Hierarchical Intention Embedding Network for Click-Through Rate Prediction.pdf",year:1900,id:128},{tag:["Industry"],name:"Hybrid Interest Modeling for Long-tailed Users",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Hybrid Interest Modeling for Long-tailed Users.pdf",year:1900,id:129},{tag:["Industry"],name:"Implicit User Awareness Modeling via Candidate Items for CTR Prediction in Search Ads",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Implicit User Awareness Modeling via Candidate Items for CTR Prediction in Search Ads.pdf",year:1900,id:130},{tag:["Industry"],name:"Improving Deep Learning For Airbnb Search",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Improving Deep Learning For Airbnb Search.pdf",year:1900,id:131},{tag:["Industry"],name:"Improving Recommendation Quality in Google Drive",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Improving Recommendation Quality in Google Drive.pdf",year:1900,id:132},{tag:["Industry"],name:"Lifelong Sequential Modeling with Personalized Memorization for User Response Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Lifelong Sequential Modeling with Personalized Memorization for User Response Prediction.pdf",year:1900,id:133},{tag:["Industry"],name:"Long Short-Term Temporal Meta-learning in Online Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Long Short-Term Temporal Meta-learning in Online Recommendation.pdf",year:1900,id:134},{tag:["Industry"],name:"MaskNet - Introducing Feature-Wise Multiplication to CTR Ranking Models by Instance-Guided Mask",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/MaskNet - Introducing Feature-Wise Multiplication to CTR Ranking Models by Instance-Guided Mask.pdf",year:1900,id:135},{tag:["Industry"],name:"Modeling Users’ Contextualized Page-wise Feedback for Click-Through Rate Prediction in E-commerce Search",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Modeling Users’ Contextualized Page-wise Feedback for Click-Through Rate Prediction in E-commerce Search.pdf",year:1900,id:136},{tag:["Industry"],name:"MRIF - Multi-resolution Interest Fusion for Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/MRIF - Multi-resolution Interest Fusion for Recommendation.pdf",year:1900,id:137},{tag:["Industry"],name:"Multi-Interactive Attention Network for Fine-grained Feature Learning in CTR Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Multi-Interactive Attention Network for Fine-grained Feature Learning in CTR Prediction.pdf",year:1900,id:138},{tag:["Industry"],name:"News Recommendation with Candidate-aware User Modeling",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/News Recommendation with Candidate-aware User Modeling.pdf",year:1900,id:139},{tag:["Industry"],name:"Product-based Neural Networks for User Response Prediction over Multi-field Categorical Data",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Product-based Neural Networks for User Response Prediction over Multi-field Categorical Data.pdf",year:1900,id:140},{tag:["Industry"],name:"Recommender Transformers with Behavior Pathways",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Recommender Transformers with Behavior Pathways.pdf",year:1900,id:141},{tag:["Industry"],name:"Res-embedding for Deep Learning Based Click-Through Rate Prediction Modeling",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Res-embedding for Deep Learning Based Click-Through Rate Prediction Modeling.pdf",year:1900,id:142},{tag:["Industry"],name:"Sampling Is All You Need on Modeling Long-Term User Behaviors for CTR Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Sampling Is All You Need on Modeling Long-Term User Behaviors for CTR Prediction.pdf",year:1900,id:143},{tag:["Industry"],name:"Sequential Modeling with Multiple Attributes for Watchlist Recommendation in E-Commerce",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Sequential Modeling with Multiple Attributes for Watchlist Recommendation in E-Commerce.pdf",year:1900,id:144},{tag:["Industry"],name:"TencentRec - Real-time Stream Recommendation in Practice",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/TencentRec - Real-time Stream Recommendation in Practice.pdf",year:1900,id:145},{tag:["Industry"],name:"TiSSA - A Time Slice Self-Attention Approach for Modeling Sequential User Behaviors",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/TiSSA - A Time Slice Self-Attention Approach for Modeling Sequential User Behaviors.pdf",year:1900,id:146},{tag:["Industry"],name:"Triangle Graph Interest Network for Click-through Rate Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Triangle Graph Interest Network for Click-through Rate Prediction.pdf",year:1900,id:147},{tag:["Industry"],name:"User Behavior Retrieval for Click-Through Rate Prediction",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/User Behavior Retrieval for Click-Through Rate Prediction.pdf",year:1900,id:148},{tag:["Industry"],name:"[2016][Microsoft] User Fatigue in Online News Recommendation",category:"Industry",authors:[],company:"Microsoft",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2016][Microsoft] User Fatigue in Online News Recommendation.pdf",year:2016,id:149},{tag:["Industry"],name:"[2016][Youtube] Deep Neural Networks for YouTube Recommendations",category:"Industry",authors:[],company:"Youtube",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2016][Youtube] Deep Neural Networks for YouTube Recommendations.pdf",year:2016,id:150},{tag:["Industry"],name:"[2017][Alibaba][ATRank] ATRank - An Attention-Based User Behavior Modeling Framework for Recommendation",category:"Industry",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2017][Alibaba][ATRank] ATRank - An Attention-Based User Behavior Modeling Framework for Recommendation.pdf",year:2017,id:151},{tag:["Industry"],name:"[2017][Alibaba][DIN] Deep Interest Network for Click-Through Rate Prediction",category:"Industry",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2017][Alibaba][DIN] Deep Interest Network for Click-Through Rate Prediction.pdf",year:2017,id:152},{tag:["Industry"],name:"[2018][Airbnb] Real-time Personalization using Embeddings for Search Ranking at Airbnb",category:"Industry",authors:[],company:"Airbnb",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2018][Airbnb] Real-time Personalization using Embeddings for Search Ranking at Airbnb.pdf",year:2018,id:153},{tag:["Industry"],name:"[2018][Alibaba][DIEN] Deep Interest Evolution Network for Click-Through Rate Prediction",category:"Industry",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2018][Alibaba][DIEN] Deep Interest Evolution Network for Click-Through Rate Prediction.pdf",year:2018,id:154},{tag:["Industry"],name:"[2018][FwFM] Field-weighted Factorization Machines for Click-Through Rate Prediction in Display Advertising",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2018][FwFM] Field-weighted Factorization Machines for Click-Through Rate Prediction in Display Advertising.pdf",year:2018,id:155},{tag:["Industry"],name:"[2019][Airbnb] Applying Deep Learning To Airbnb Search",category:"Industry",authors:[],company:"Airbnb",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2019][Airbnb] Applying Deep Learning To Airbnb Search.pdf",year:2018,id:156},{tag:["Industry"],name:"[2019][Alibaba][BST] Behavior Sequence Transformer for E-commerceRecommendation in Alibaba",category:"Industry",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2019][Alibaba][BST] Behavior Sequence Transformer for E-commerceRecommendation in Alibaba.pdf",year:2019,id:157},{tag:["Industry"],name:"[2019][Alibaba][DSIN] Deep Session Interest Network for Click-Through Rate Prediction",category:"Industry",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2019][Alibaba][DSIN] Deep Session Interest Network for Click-Through Rate Prediction.pdf",year:2019,id:158},{tag:["Industry"],name:"[2019][Alibaba][MIMN] Practice on Long Sequential User Behavior Modeling for Click-Through Rate Prediction",category:"Industry",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2019][Alibaba][MIMN] Practice on Long Sequential User Behavior Modeling for Click-Through Rate Prediction.pdf",year:2019,id:159},{tag:["Industry"],name:"[2019][Weibo][FiBiNET] FiBiNET - Combining Feature Importance and Bilinear feature Interaction for Click-Through Rate Prediction",category:"Industry",authors:[],company:"Weibo",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2019][Weibo][FiBiNET] FiBiNET - Combining Feature Importance and Bilinear feature Interaction for Click-Through Rate Prediction.pdf",year:2019,id:160},{tag:["Industry"],name:"[2020][Alibaba][DMR] Deep Match to Rank Model for Personalized Click-Through Rate Prediction",category:"Industry",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2020][Alibaba][DMR] Deep Match to Rank Model for Personalized Click-Through Rate Prediction.pdf",year:2020,id:161},{tag:["Industry"],name:"[2020][Alibaba][ESAM] ESAM - Discriminative Domain Adaptation with Non-Displayed Items to Improve Long-Tail Performance",category:"Industry",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2020][Alibaba][ESAM] ESAM - Discriminative Domain Adaptation with Non-Displayed Items to Improve Long-Tail Performance.pdf",year:2020,id:162},{tag:["Industry"],name:"[2020][Alibaba][SIM] Search-based User Interest Modeling with Lifelong Sequential Behavior Data for Click-Through Rate Prediction",category:"Industry",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2020][Alibaba][SIM] Search-based User Interest Modeling with Lifelong Sequential Behavior Data for Click-Through Rate Prediction.pdf",year:2020,id:163},{tag:["Industry"],name:"[2021][Alibaba][DINMP] A Non-sequential Approach to Deep User Interest Model for Click-Through Rate Prediction",category:"Industry",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2021][Alibaba][DINMP] A Non-sequential Approach to Deep User Interest Model for Click-Through Rate Prediction.pdf",year:2021,id:164},{tag:["Industry"],name:"[2021][Fliggy] [DMSN] Spatial-Temporal Deep Intention Destination Networks for Online Travel Planning",category:"Industry",authors:[],company:"Fliggy",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2021][Fliggy] [DMSN] Spatial-Temporal Deep Intention Destination Networks for Online Travel Planning.pdf",year:2021,id:165},{tag:["Industry"],name:"[2021][Google] Bootstrapping Recommendations at Chrome Web Store",category:"Industry",authors:[],company:"Google",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2021][Google] Bootstrapping Recommendations at Chrome Web Store.pdf",year:2021,id:166},{tag:["Industry","AutoDis"],name:"[2021][Huawei][AutoDis] An Embedding Learning Framework for Numerical Features in CTR Prediction",category:"Industry",authors:[],company:"Huawei",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/[2021][Huawei][AutoDis] An Embedding Learning Framework for Numerical Features in CTR Prediction.pdf",year:2021,id:167},{tag:["Look-Alike"],name:"A Sub-linear, Massive-scale Look-alike Audience Extension System",category:"Look-Alike",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Look-Alike/A Sub-linear, Massive-scale Look-alike Audience Extension System.pdf",year:2021,id:168},{tag:["Look-Alike"],name:"Audience Expansion for Online Social Network Advertising",category:"Look-Alike",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Look-Alike/Audience Expansion for Online Social Network Advertising.pdf",year:1900,id:169},{tag:["Look-Alike"],name:"Effective Audience Extension in Online Advertising",category:"Look-Alike",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Look-Alike/Effective Audience Extension in Online Advertising.pdf",year:1900,id:170},{tag:["Look-Alike"],name:"Finding Users Who Act Alike - Transfer Learning for Expanding",category:"Look-Alike",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Look-Alike/Finding Users Who Act Alike - Transfer Learning for Expanding.pdf",year:1900,id:171},{tag:["Look-Alike","RALM"],name:"[2019][Tencent][RALM] Real-time Attention Based Look-alike Model for Recommender System",category:"Look-Alike",authors:[],company:"Tencent",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Look-Alike/[2019][Tencent][RALM] Real-time Attention Based Look-alike Model for Recommender System.pdf",year:2019,id:172},{tag:["Match"],name:"A Dual Augmented Two-tower Model for Online Large-scale Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/A Dual Augmented Two-tower Model for Online Large-scale Recommendation.pdf",year:1900,id:173},{tag:["Match"],name:"A User-Centered Concept Mining System for Query and Document Understanding at Tencent",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/A User-Centered Concept Mining System for Query and Document Understanding at Tencent.pdf",year:1900,id:174},{tag:["Match"],name:"CROLoss - Towards a Customizable Loss for Retrieval Models in Recommender Systems",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/CROLoss - Towards a Customizable Loss for Retrieval Models in Recommender Systems.pdf",year:1900,id:175},{tag:["Match"],name:"Cross-Batch Negative Sampling for Training Two-Tower Recommenders",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Cross-Batch Negative Sampling for Training Two-Tower Recommenders.pdf",year:1900,id:176},{tag:["Match"],name:"Deep Retrieval - Learning A Retrievable Structure for Large-Scale Recommendations",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Deep Retrieval - Learning A Retrievable Structure for Large-Scale Recommendations.pdf",year:1900,id:177},{tag:["Match"],name:"Disentangled Self-Supervision in Sequential Recommenders",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Disentangled Self-Supervision in Sequential Recommenders.pdf",year:1900,id:178},{tag:["Match"],name:"Efficient Training on Very Large Corpora via Gramian Estimation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Efficient Training on Very Large Corpora via Gramian Estimation.pdf",year:1900,id:179},{tag:["Match"],name:"Extreme Multi-label Learning for Semantic Matching in Product Search",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Extreme Multi-label Learning for Semantic Matching in Product Search.pdf",year:1900,id:180},{tag:["Match"],name:"Factorization Meets the Neighborhood - a Multifaceted Collaborative Filtering Model",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Factorization Meets the Neighborhood - a Multifaceted Collaborative Filtering Model.pdf",year:1900,id:181},{tag:["Match"],name:"Heterogeneous Graph Neural Networks for Large-Scale Bid Keyword Matching",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Heterogeneous Graph Neural Networks for Large-Scale Bid Keyword Matching.pdf",year:1900,id:182},{tag:["Match"],name:"Itinerary-aware Personalized Deep Matching at Fliggy",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Itinerary-aware Personalized Deep Matching at Fliggy.pdf",year:1900,id:183},{tag:["Match"],name:"Joint Optimization of Tree-based Index and Deep Model for Recommender Systems",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Joint Optimization of Tree-based Index and Deep Model for Recommender Systems.pdf",year:1900,id:184},{tag:["Match"],name:"Learning Deep Structured Semantic Models for Web Search using Clickthrough Data",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Learning Deep Structured Semantic Models for Web Search using Clickthrough Data.pdf",year:1900,id:185},{tag:["Match"],name:"Learning Tree-based Deep Model for Recommender Systems",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Learning Tree-based Deep Model for Recommender Systems.pdf",year:1900,id:186},{tag:["Match"],name:"Octopus - Comprehensive and Elastic User Representation for the Generation of Recommendation Candidates",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Octopus - Comprehensive and Elastic User Representation for the Generation of Recommendation Candidates.pdf",year:1900,id:187},{tag:["Match"],name:"Path-based Deep Network for Candidate Item Matching in Recommenders",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Path-based Deep Network for Candidate Item Matching in Recommenders.pdf",year:1900,id:188},{tag:["Match"],name:"Self-Attentive Sequential Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Self-Attentive Sequential Recommendation.pdf",year:1900,id:189},{tag:["Match"],name:"Sparse-Interest Network for Sequential Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Sparse-Interest Network for Sequential Recommendation.pdf",year:1900,id:190},{tag:["Match"],name:"Towards Personalized and Semantic Retrieval - An End-to-End Solution for E-commerce Search via Embedding Learning",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Towards Personalized and Semantic Retrieval - An End-to-End Solution for E-commerce Search via Embedding Learning.pdf",year:1900,id:191},{tag:["Match"],name:"Uni-Retriever - Towards Learning The Unified Embedding Based Retriever in Bing Sponsored Search",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Uni-Retriever - Towards Learning The Unified Embedding Based Retriever in Bing Sponsored Search.pdf",year:1900,id:192},{tag:["Match"],name:"XDM - Improving Sequential Deep Matching with Unclicked User Behaviors for Recommender System",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/XDM - Improving Sequential Deep Matching with Unclicked User Behaviors for Recommender System.pdf",year:1900,id:193},{tag:["Match"],name:"[2015][Microsoft][DSSM in Recsys] A Multi-View Deep Learning Approach for Cross Domain User Modeling in Recommendation Systems",category:"Match",authors:[],company:"Microsoft",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2015][Microsoft][DSSM in Recsys] A Multi-View Deep Learning Approach for Cross Domain User Modeling in Recommendation Systems.pdf",year:2015,id:194},{tag:["Match"],name:"[2016][Yahoo][App2Vec] App2Vec - Vector Modeling of Mobile Apps and Applications",category:"Match",authors:[],company:"Yahoo",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2016][Yahoo][App2Vec] App2Vec - Vector Modeling of Mobile Apps and Applications.pdf",year:2016,id:195},{tag:["Match"],name:"[2018][TC-CML] Loss Aversion in Recommender Systems - Utilizing Negative User Preference to Improve Recommendation Quality",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2018][TC-CML] Loss Aversion in Recommender Systems - Utilizing Negative User Preference to Improve Recommendation Quality.pdf",year:2018,id:196},{tag:["Match"],name:"[2019][Alibaba][SDM] SDM - Sequential Deep Matching Model for Online Large-scale Recommender System",category:"Match",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2019][Alibaba][SDM] SDM - Sequential Deep Matching Model for Online Large-scale Recommender System.pdf",year:2019,id:197},{tag:["Match"],name:"[2019][Baidu][MOBIUS] MOBIUS - Towards the Next Generation of Query-Ad Matching in Baidu’s Sponsored Search",category:"Match",authors:[],company:"Baidu",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2019][Baidu][MOBIUS] MOBIUS - Towards the Next Generation of Query-Ad Matching in Baidu’s Sponsored Search.pdf",year:2019,id:198},{tag:["Match"],name:"[2019][Google] Sampling-Bias-Corrected Neural Modeling for Large Corpus Item Recommendations",category:"Match",authors:[],company:"Google",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2019][Google] Sampling-Bias-Corrected Neural Modeling for Large Corpus Item Recommendations.pdf",year:2019,id:199},{tag:["Match"],name:"[2020][Alibaba][Swing&Surprise] Large Scale Product Graph Construction for Recommendation in E-commerce",category:"Match",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2020][Alibaba][Swing&Surprise] Large Scale Product Graph Construction for Recommendation in E-commerce.pdf",year:2020,id:200},{tag:["Match"],name:"[2020][Facebook][EBR] Embedding-based Retrieval in Facebook Search",category:"Match",authors:[],company:"Facebook",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2020][Facebook][EBR] Embedding-based Retrieval in Facebook Search.pdf",year:2020,id:201},{tag:["Match"],name:"[2020][Google][MNS] Mixed Negative Sampling for Learning Two-tower Neural Networks in Recommendations",category:"Match",authors:[],company:"Google",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2020][Google][MNS] Mixed Negative Sampling for Learning Two-tower Neural Networks in Recommendations.pdf",year:2020,id:202},{tag:["Match"],name:"[2020][Weixin][UTPM] Learning to Build User-tag Profile in Recommendation System",category:"Match",authors:[],company:"Weixin",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2020][Weixin][UTPM] Learning to Build User-tag Profile in Recommendation System.pdf",year:2020,id:203},{tag:["Match"],name:"[2021][Alibaba][MGDSPR] Embedding-based Product Retrieval in Taobao Search",category:"Match",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2021][Alibaba][MGDSPR] Embedding-based Product Retrieval in Taobao Search.pdf",year:2021,id:204},{tag:["Match"],name:"[2021][Google] Self-supervised Learning for Large-scale Item Recommendations",category:"Match",authors:[],company:"Google",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/[2021][Google] Self-supervised Learning for Large-scale Item Recommendations.pdf",year:2021,id:205},{tag:["Multi-Modal"],name:"Adversarial Multimodal Representation Learning for Click-Through Rate Prediction",category:"Multi-Modal",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Modal/Adversarial Multimodal Representation Learning for Click-Through Rate Prediction.pdf",year:1900,id:206},{tag:["Multi-Modal"],name:"Pretraining Representations of Multi-modal Multi-query E-commerce Search",category:"Multi-Modal",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Modal/Pretraining Representations of Multi-modal Multi-query E-commerce Search.pdf",year:1900,id:207},{tag:["Multi-Scenario"],name:"A Survey on Cross-domain Recommendation - Taxonomies, Methods, and Future Directions",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/A Survey on Cross-domain Recommendation - Taxonomies, Methods, and Future Directions.pdf",year:1900,id:208},{tag:["Multi-Scenario"],name:"AdaSparse - Learning Adaptively Sparse Structures for Multi-Domain Click-Through Rate Prediction",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/AdaSparse - Learning Adaptively Sparse Structures for Multi-Domain Click-Through Rate Prediction.pdf",year:1900,id:209},{tag:["Multi-Scenario"],name:"APG - Adaptive Parameter Generation Network for Click-Through Rate Prediction",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/APG - Adaptive Parameter Generation Network for Click-Through Rate Prediction.pdf",year:1900,id:210},{tag:["Multi-Scenario"],name:"Automatic Expert Selection for Multi-Scenario and Multi-Task Search",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/Automatic Expert Selection for Multi-Scenario and Multi-Task Search.pdf",year:1900,id:211},{tag:["Multi-Scenario"],name:"Continual Transfer Learning for Cross-Domain Click-Through Rate Prediction at Taobao",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/Continual Transfer Learning for Cross-Domain Click-Through Rate Prediction at Taobao.pdf",year:1900,id:212},{tag:["Multi-Scenario"],name:"Cross-Domain Recommendation - An Embedding and Mapping Approach",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/Cross-Domain Recommendation - An Embedding and Mapping Approach.pdf",year:1900,id:213},{tag:["Multi-Scenario"],name:"Dynamic collaborative filtering Thompson Sampling for cross-domain advertisements recommendation",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/Dynamic collaborative filtering Thompson Sampling for cross-domain advertisements recommendation.pdf",year:1900,id:214},{tag:["Multi-Scenario"],name:"Improving Multi-Scenario Learning to Rank in E-commerce by Exploiting Task Relationships in the Label Space",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/Improving Multi-Scenario Learning to Rank in E-commerce by Exploiting Task Relationships in the Label Space.pdf",year:1900,id:215},{tag:["Multi-Scenario"],name:"KEEP - An Industrial Pre-Training Framework for Online Recommendation via Knowledge Extraction and Plugging",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/KEEP - An Industrial Pre-Training Framework for Online Recommendation via Knowledge Extraction and Plugging.pdf",year:1900,id:216},{tag:["Multi-Scenario"],name:"Leaving No One Behind- A Multi-Scenario Multi-Task Meta Learning Approach for Advertiser Modeling",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/Leaving No One Behind- A Multi-Scenario Multi-Task Meta Learning Approach for Advertiser Modeling.pdf",year:1900,id:217},{tag:["Multi-Scenario"],name:"Multi-Graph based Multi-Scenario Recommendation in Large-scale Online Video Services",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/Multi-Graph based Multi-Scenario Recommendation in Large-scale Online Video Services.pdf",year:1900,id:218},{tag:["Multi-Scenario"],name:"Personalized Transfer of User Preferences for Cross-domain Recommendation",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/Personalized Transfer of User Preferences for Cross-domain Recommendation.pdf",year:1900,id:219},{tag:["Multi-Scenario"],name:"Scenario-Adaptive and Self-Supervised Model for Multi-Scenario Personalized Recommendation",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/Scenario-Adaptive and Self-Supervised Model for Multi-Scenario Personalized Recommendation.pdf",year:1900,id:220},{tag:["Multi-Scenario"],name:"Scenario-aware and Mutual-based approach for Multi-scenario Recommendation in E-Commerce",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/Scenario-aware and Mutual-based approach for Multi-scenario Recommendation in E-Commerce.pdf",year:1900,id:221},{tag:["Multi-Scenario"],name:"Self-Supervised Learning on Users’ Spontaneous Behaviors for Multi-Scenario Ranking in E-commerce",category:"Multi-Scenario",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/Self-Supervised Learning on Users’ Spontaneous Behaviors for Multi-Scenario Ranking in E-commerce.pdf",year:1900,id:222},{tag:["Multi-Scenario"],name:"[2020][JD][DADNN] DADNN - Multi-Scene CTR Prediction via Domain-Aware Deep Neural Network",category:"Multi-Scenario",authors:[],company:"JD",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/[2020][JD][DADNN] DADNN - Multi-Scene CTR Prediction via Domain-Aware Deep Neural Network.pdf",year:1900,id:223},{tag:["Multi-Scenario"],name:"[2021][Alibaba][STAR] One Model to Serve All - Star Topology Adaptive Recommenderfor Multi-Domain CTR Prediction",category:"Multi-Scenario",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Scenario/[2021][Alibaba][STAR] One Model to Serve All - Star Topology Adaptive Recommenderfor Multi-Domain CTR Prediction.pdf",year:1900,id:224},{tag:["Multi-Task"],name:"Can Small Heads Help Understanding and Improving Multi-Task Generalization",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Can Small Heads Help Understanding and Improving Multi-Task Generalization.pdf",year:1900,id:225},{tag:["Multi-Task"],name:"DSelect-k - Differentiable Selection in the Mixture of Experts with Applications to Multi-Task Learning",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/DSelect-k - Differentiable Selection in the Mixture of Experts with Applications to Multi-Task Learning.pdf",year:1900,id:226},{tag:["Multi-Task"],name:"Entire Space Multi-Task Modeling via Post-Click Behavior Decomposition for Conversion Rate Prediction",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Entire Space Multi-Task Modeling via Post-Click Behavior Decomposition for Conversion Rate Prediction.pdf",year:1900,id:227},{tag:["Multi-Task"],name:"GemNN - Gating-Enhanced Multi-Task Neural Networks with Feature Interaction Learning for CTR Prediction",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/GemNN - Gating-Enhanced Multi-Task Neural Networks with Feature Interaction Learning for CTR Prediction.pdf",year:1900,id:228},{tag:["Multi-Task"],name:"Hierarchically Modeling Micro and Macro Behaviors via Multi-Task Learning for Conversion Rate Prediction",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Hierarchically Modeling Micro and Macro Behaviors via Multi-Task Learning for Conversion Rate Prediction.pdf",year:1900,id:229},{tag:["Multi-Task"],name:"HyperGrid Transformers - Towards A Single Model for Multiple Tasks",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/HyperGrid Transformers - Towards A Single Model for Multiple Tasks.pdf",year:1900,id:230},{tag:["Multi-Task"],name:"MetaBalance - Improving Multi-Task Recommendations via Adapting Gradient Magnitudes of Auxiliary Tasks",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/MetaBalance - Improving Multi-Task Recommendations via Adapting Gradient Magnitudes of Auxiliary Tasks.pdf",year:1900,id:231},{tag:["Multi-Task"],name:"Mixture of Virtual-Kernel Experts for Multi-Objective User Profile Modeling",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Mixture of Virtual-Kernel Experts for Multi-Objective User Profile Modeling.pdf",year:1900,id:232},{tag:["Multi-Task"],name:"MSSM - A Multiple-level Sparse Sharing Model for Efficient Multi-Task Learning",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/MSSM - A Multiple-level Sparse Sharing Model for Efficient Multi-Task Learning.pdf",year:1900,id:233},{tag:["Multi-Task"],name:"Multi-Objective Ranking Optimization for Product Search Using Stochastic Label Aggregation",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Multi-Objective Ranking Optimization for Product Search Using Stochastic Label Aggregation.pdf",year:1900,id:234},{tag:["Multi-Task"],name:"Multi-Task Learning as Multi-Objective Optimization - slide",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Multi-Task Learning as Multi-Objective Optimization - slide.pdf",year:1900,id:235},{tag:["Multi-Task"],name:"Multi-Task Learning for Dense Prediction Tasks - A Survey",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Multi-Task Learning for Dense Prediction Tasks - A Survey.pdf",year:1900,id:236},{tag:["Multi-Task"],name:"Pareto Multi-Task Learning",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Pareto Multi-Task Learning.pdf",year:1900,id:237},{tag:["Multi-Task"],name:"Perceive Your Users in Depth - Learning Universal User Representations from Multiple E-commerce Tasks",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Perceive Your Users in Depth - Learning Universal User Representations from Multiple E-commerce Tasks.pdf",year:1900,id:238},{tag:["Multi-Task"],name:"Personalized Approximate Pareto-Efficient Recommendation",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Personalized Approximate Pareto-Efficient Recommendation.pdf",year:1900,id:239},{tag:["Multi-Task"],name:"SNR - Sub-Network Routing for Flexible Parameter Sharing in Multi-Task Learning",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/SNR - Sub-Network Routing for Flexible Parameter Sharing in Multi-Task Learning.pdf",year:1900,id:240},{tag:["Multi-Task"],name:"Understanding and Improving Fairness-Accuracy Trade-offs in Multi-Task Learning",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Understanding and Improving Fairness-Accuracy Trade-offs in Multi-Task Learning.pdf",year:1900,id:241},{tag:["Multi-Task"],name:"Why I like it - multi-task learning for recommendation and explanation",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/Why I like it - multi-task learning for recommendation and explanation.pdf",year:1900,id:242},{tag:["Multi-Task","MGDA"],name:"[2012][MGDA] Multiple-gradient descent algorithm (MGDA) for multiobjective optimization",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2012][MGDA] Multiple-gradient descent algorithm (MGDA) for multiobjective optimization.pdf",year:2012,id:243},{tag:["Multi-Task","ESMM"],name:"[2018][Alibaba][ESMM] Entire Space Multi-Task Model - An Effective Approach for Estimating Post-Click Conversion Rate",category:"Multi-Task",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2018][Alibaba][ESMM] Entire Space Multi-Task Model - An Effective Approach for Estimating Post-Click Conversion Rate.pdf",year:2018,id:244},{tag:["Multi-Task"],name:"[2018][Cambridge] Multi-Task Learning Using Uncertainty to Weigh Losses for Scene Geometry and Semantics",category:"Multi-Task",authors:[],company:"Cambridge",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2018][Cambridge] Multi-Task Learning Using Uncertainty to Weigh Losses for Scene Geometry and Semantics.pdf",year:2018,id:245},{tag:["Multi-Task","MMOE"],name:"[2018][Google][MMOE] Modeling Task Relationships in Multi-task Learning with Multi-gate Mixture-of-Experts",category:"Multi-Task",authors:[],company:"Google",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2018][Google][MMOE] Modeling Task Relationships in Multi-task Learning with Multi-gate Mixture-of-Experts.pdf",year:2018,id:246},{tag:["Multi-Task","GradNorm"],name:"[2018][MagicLeap][GradNorm] GradNorm - Gradient Normalization for Adaptive Loss Balancing in Deep Multitask Networks",category:"Multi-Task",authors:[],company:"MagicLeap",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2018][MagicLeap][GradNorm] GradNorm - Gradient Normalization for Adaptive Loss Balancing in Deep Multitask Networks.pdf",year:2018,id:247},{tag:["Multi-Task"],name:"[2019][Alibaba] A Pareto-Efficient Algorithm for Multiple Objective Optimization in E-Commerce Recommendation",category:"Multi-Task",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2019][Alibaba] A Pareto-Efficient Algorithm for Multiple Objective Optimization in E-Commerce Recommendation.pdf",year:2019,id:248},{tag:["Multi-Task"],name:"[2019][Alibaba][DBMTL] Deep Bayesian Multi-Target Learning for Recommender Systems",category:"Multi-Task",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2019][Alibaba][DBMTL] Deep Bayesian Multi-Target Learning for Recommender Systems.pdf",year:2019,id:249},{tag:["Multi-Task"],name:"[2019][Intel] Multi-Task Learning as Multi-Objective Optimization",category:"Multi-Task",authors:[],company:"Intel",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2019][Intel] Multi-Task Learning as Multi-Objective Optimization.pdf",year:2019,id:250},{tag:["Multi-Task"],name:"[2019][Youtube] Recommending What Video to Watch Next - A Multitask Ranking System",category:"Multi-Task",authors:[],company:"Youtube",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2019][Youtube] Recommending What Video to Watch Next - A Multitask Ranking System.pdf",year:2019,id:251},{tag:["Multi-Task"],name:"[2020][Alibaba][Multi-IPW&Multi-DR] LARGE-SCALE CAUSAL APPROACHES TO DEBIASING POST-CLICK CONVERSION RATE ESTIMATION WITH MULTI-TASK LEARNING",category:"Multi-Task",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2020][Alibaba][Multi-IPW&Multi-DR] LARGE-SCALE CAUSAL APPROACHES TO DEBIASING POST-CLICK CONVERSION RATE ESTIMATION WITH MULTI-TASK LEARNING.pdf",year:2020,id:252},{tag:["Multi-Task"],name:"[2020][Google][MoSE] Multitask Mixture of Sequential Experts for User Activity Streams",category:"Multi-Task",authors:[],company:"Google",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2020][Google][MoSE] Multitask Mixture of Sequential Experts for User Activity Streams.pdf",year:2020,id:253},{tag:["Multi-Task"],name:"[2020][JD][DMT] Deep Multifaceted Transformers for Multi-objective Ranking in Large-Scale E-commerce Recommender Systems",category:"Multi-Task",authors:[],company:"JD",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2020][JD][DMT] Deep Multifaceted Transformers for Multi-objective Ranking in Large-Scale E-commerce Recommender Systems.pdf",year:2020,id:254},{tag:["Multi-Task"],name:"[2020][PCGrad] Gradient Surgery for Multi-Task Learning",category:"Multi-Task",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2020][PCGrad] Gradient Surgery for Multi-Task Learning.pdf",year:2020,id:255},{tag:["Multi-Task"],name:"[2020][Tencent][PLE] Progressive Layered Extraction (PLE) - A Novel Multi-Task Learning (MTL) Model for Personalized Recommendations",category:"Multi-Task",authors:[],company:"Tencent",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2020][Tencent][PLE] Progressive Layered Extraction (PLE) - A Novel Multi-Task Learning (MTL) Model for Personalized Recommendations.pdf",year:2020,id:256},{tag:["Multi-Task"],name:"[2021][Meituan][AITM] Modeling the Sequential Dependence among Audience Multi-step Conversions with Multi-task Learning in Targeted Display Advertising",category:"Multi-Task",authors:[],company:"Meituan",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2021][Meituan][AITM] Modeling the Sequential Dependence among Audience Multi-step Conversions with Multi-task Learning in Targeted Display Advertising.pdf",year:2021,id:257},{tag:["Multi-Task"],name:"[2022][Alibaba][ESCM2] ESCM2 - Entire Space Counterfactual Multi-Task Model for Post-Click Conversion Rate Estimation",category:"Multi-Task",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Multi-Task/[2022][Alibaba][ESCM2] ESCM2 - Entire Space Counterfactual Multi-Task Model for Post-Click Conversion Rate Estimation.pdf",year:2022,id:258},{tag:["Pre-Rank"],name:"AutoFAS - Automatic Feature and Architecture Selection for Pre-Ranking System",category:"Pre-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Pre-Rank/AutoFAS - Automatic Feature and Architecture Selection for Pre-Ranking System.pdf",year:1900,id:259},{tag:["Pre-Rank"],name:"Cascade Ranking for Operational E-commerce Search",category:"Pre-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Pre-Rank/Cascade Ranking for Operational E-commerce Search.pdf",year:1900,id:260},{tag:["Pre-Rank"],name:"Contrastive Information Transfer for Pre-Ranking Systems",category:"Pre-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Pre-Rank/Contrastive Information Transfer for Pre-Ranking Systems.pdf",year:1900,id:261},{tag:["Pre-Rank"],name:"EENMF - An End-to-End Neural Matching Framework for E-Commerce Sponsored Search",category:"Pre-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Pre-Rank/EENMF - An End-to-End Neural Matching Framework for E-Commerce Sponsored Search.pdf",year:1900,id:262},{tag:["Pre-Rank"],name:"[2020][Alibaba][COLD] COLD - Towards the Next Generation of Pre-Ranking System",category:"Pre-Rank",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Pre-Rank/[2020][Alibaba][COLD] COLD - Towards the Next Generation of Pre-Ranking System.pdf",year:2020,id:263},{tag:["Pre-Rank"],name:"[2021][Alibaba] Towards a Better Tradeoff between Effectiveness and Efficiency in Pre-Ranking - A Learnable Feature Selection based Approach",category:"Pre-Rank",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Pre-Rank/[2021][Alibaba] Towards a Better Tradeoff between Effectiveness and Efficiency in Pre-Ranking - A Learnable Feature Selection based Approach.pdf",year:2021,id:264},{tag:["Pre-Rank"],name:"[2022] On Ranking Consistency of Pre-ranking Stage",category:"Pre-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Pre-Rank/[2022] On Ranking Consistency of Pre-ranking Stage.pdf",year:2022,id:265},{tag:["Rank"],name:"SESSION-BASED RECOMMENDATIONS WITH RECURRENT NEURAL NETWORKS",category:"Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/SESSION-BASED RECOMMENDATIONS WITH RECURRENT NEURAL NETWORKS.pdf",year:1900,id:266},{tag:["Rank"],name:"[2009][BPR] Bayesian Personalized Ranking from Implicit Feedback",category:"Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2009][BPR] Bayesian Personalized Ranking from Implicit Feedback.pdf",year:2009,id:267},{tag:["Rank"],name:"[2010][FM] Factorization Machines",category:"Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2010][FM] Factorization Machines.pdf",year:2010,id:268},{tag:["Rank"],name:"[2014][Facebook][GBDT+LR] Practical Lessons from Predicting Clicks on Ads at Facebook",category:"Rank",authors:[],company:"Facebook",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2014][Facebook][GBDT+LR] Practical Lessons from Predicting Clicks on Ads at Facebook.pdf",year:2014,id:269},{tag:["Rank"],name:"[2016][Google][Wide&Deep] Wide & Deep Learning for Recommender Systems",category:"Rank",authors:[],company:"Google",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2016][Google][Wide&Deep] Wide & Deep Learning for Recommender Systems.pdf",year:2016,id:270},{tag:["Rank"],name:"[2016][Microsft][Deep Crossing] Deep Crossing - Web-Scale Modeling without Manually Crafted Combinatorial Features",category:"Rank",authors:[],company:"Microsoft",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2016][Microsft][Deep Crossing] Deep Crossing - Web-Scale Modeling without Manually Crafted Combinatorial Features.pdf",year:2016,id:271},{tag:["Rank"],name:"[2016][NTU][FFM] Field-aware Factorization Machines for CTR Prediction",category:"Rank",authors:[],company:"NTU",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2016][NTU][FFM] Field-aware Factorization Machines for CTR Prediction.pdf",year:2016,id:272},{tag:["Rank"],name:"[2016][SJTU][PNN] Product-based Neural Networks for User Response Prediction",category:"Rank",authors:[],company:"SJTU",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2016][SJTU][PNN] Product-based Neural Networks for User Response Prediction.pdf",year:2016,id:273},{tag:["Rank"],name:"[2016][UCL][FNN] Deep Learning over Multi-field Categorical Data",category:"Rank",authors:[],company:"UCL",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2016][UCL][FNN] Deep Learning over Multi-field Categorical Data.pdf",year:2016,id:274},{tag:["Rank"],name:"[2017][Alibaba][MLR] Learning Piece-wise Linear Models from Large Scale Data for Ad Click Prediction",category:"Rank",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2017][Alibaba][MLR] Learning Piece-wise Linear Models from Large Scale Data for Ad Click Prediction.pdf",year:2017,id:275},{tag:["Rank"],name:"[2017][Huawei][DeepFM] A Factorization-Machine based Neural Network for CTR Prediction",category:"Rank",authors:[],company:"Huawei",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2017][Huawei][DeepFM] A Factorization-Machine based Neural Network for CTR Prediction.pdf",year:2017,id:276},{tag:["Rank"],name:"[2017][NUS][NCF] Neural Collaborative Filtering",category:"Rank",authors:[],company:"NUS",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2017][NUS][NCF] Neural Collaborative Filtering.pdf",year:2017,id:277},{tag:["Rank"],name:"[2017][NUS][NFM] Neural Factorization Machines for Sparse Predictive Analytics",category:"Rank",authors:[],company:"NUS",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2017][NUS][NFM] Neural Factorization Machines for Sparse Predictive Analytics.pdf",year:2017,id:278},{tag:["Rank"],name:"[2017][Stanford][DCN] Deep & Cross Network for Ad Click Predictions",category:"Rank",authors:[],company:"Stanford",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2017][Stanford][DCN] Deep & Cross Network for Ad Click Predictions.pdf",year:2017,id:279},{tag:["Rank"],name:"[2017][ZJU][AFM] Attentional Factorization Machines - Learning the Weight of Feature Interactions via Attention Networks",category:"Rank",authors:[],company:"ZJU",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2017][ZJU][AFM] Attentional Factorization Machines - Learning the Weight of Feature Interactions via Attention Networks.pdf",year:2017,id:280},{tag:["Rank"],name:"[2018][USTC][xDeepFM] xDeepFM - Combining Explicit and Implicit Feature Interactions for Recommender Systems",category:"Rank",authors:[],company:"USTC",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2018][USTC][xDeepFM] xDeepFM - Combining Explicit and Implicit Feature Interactions for Recommender Systems.pdf",year:2018,id:281},{tag:["Rank"],name:"[2019][AutoInt] AutoInt - Automatic Feature Interaction Learning via Self-Attentive Neural Networks",category:"Rank",authors:[],company:"AutoInt",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2019][AutoInt] AutoInt - Automatic Feature Interaction Learning via Self-Attentive Neural Networks.pdf",year:2019,id:282},{tag:["Rank","DFN"],name:"[2020][Tencent][DFN] Deep Feedback Network for Recommendation",category:"Rank",authors:[],company:"Tencent",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Rank/[2020][Tencent][DFN] Deep Feedback Network for Recommendation.pdf",year:2020,id:283},{tag:["Re-Rank"],name:"Coverage, Redundancy and Size-Awareness in Genre Diversity for Recommender Systems",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Coverage, Redundancy and Size-Awareness in Genre Diversity for Recommender Systems.pdf",year:1900,id:284},{tag:["Re-Rank"],name:"Cross DQN - Cross Deep Q Network for Ads Allocation in Feed",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Cross DQN - Cross Deep Q Network for Ads Allocation in Feed.pdf",year:1900,id:285},{tag:["Re-Rank"],name:"GenDeR - A Generic Diversified Ranking Algorithm",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/GenDeR - A Generic Diversified Ranking Algorithm.pdf",year:1900,id:286},{tag:["Re-Rank"],name:"Globally Optimized Mutual Influence Aware Ranking in E-Commerce Search",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Globally Optimized Mutual Influence Aware Ranking in E-Commerce Search.pdf",year:1900,id:287},{tag:["Re-Rank"],name:"GRN - Generative Rerank Network for Context-wise Recommendation",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/GRN - Generative Rerank Network for Context-wise Recommendation.pdf",year:1900,id:288},{tag:["Re-Rank"],name:"Learning a Deep Listwise Context Model for Ranking Refinement",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Learning a Deep Listwise Context Model for Ranking Refinement.pdf",year:1900,id:289},{tag:["Re-Rank"],name:"Neural Re-ranking in Multi-stage Recommender Systems - A Review",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Neural Re-ranking in Multi-stage Recommender Systems - A Review.pdf",year:1900,id:290},{tag:["Re-Rank"],name:"Personalized Click Shaping through Lagrangian Duality for Online Recommendation",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Personalized Click Shaping through Lagrangian Duality for Online Recommendation.pdf",year:1900,id:291},{tag:["Re-Rank"],name:"Personalized Re-ranking for Recommendation",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Personalized Re-ranking for Recommendation.pdf",year:1900,id:292},{tag:["Re-Rank"],name:"Personalized Re-ranking with Item Relationships for E-commerce",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Personalized Re-ranking with Item Relationships for E-commerce.pdf",year:1900,id:293},{tag:["Re-Rank"],name:"Practical Diversified Recommendations on YouTube with Determinantal Point Processes",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Practical Diversified Recommendations on YouTube with Determinantal Point Processes.pdf",year:1900,id:294},{tag:["Re-Rank"],name:"Re-ranking With Constraints on Diversified Exposures for Homepage Recommender System",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Re-ranking With Constraints on Diversified Exposures for Homepage Recommender System.pdf",year:1900,id:295},{tag:["Re-Rank"],name:"Revisit Recommender System in the Permutation Prospective",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Revisit Recommender System in the Permutation Prospective.pdf",year:1900,id:296},{tag:["Re-Rank"],name:"Seq2slate - Re-ranking and slate optimization with rnns",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Seq2slate - Re-ranking and slate optimization with rnns.pdf",year:1900,id:297},{tag:["Re-Rank"],name:"SLATEQ - A Tractable Decomposition for Reinforcement Learning with Recommendation Sets",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/SLATEQ - A Tractable Decomposition for Reinforcement Learning with Recommendation Sets.pdf",year:1900,id:298},{tag:["Re-Rank"],name:"Sliding Spectrum Decomposition for Diversified Recommendation",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/Sliding Spectrum Decomposition for Diversified Recommendation.pdf",year:1900,id:299},{tag:["Re-Rank"],name:"The Use of MMR, Diversity-Based Reranking for Reordering Documents and Producing Summaries",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/The Use of MMR, Diversity-Based Reranking for Reordering Documents and Producing Summaries.pdf",year:1900,id:300},{tag:["Re-Rank"],name:"User Response Models to Improve a REINFORCE Recommender System",category:"Re-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/User Response Models to Improve a REINFORCE Recommender System.pdf",year:1900,id:301},{tag:["Re-Rank"],name:"[2018][Hulu] Fast Greedy MAP Inference for Determinantal Point Process to Improve Recommendation Diversity",category:"Re-Rank",authors:[],company:"Hulu",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/[2018][Hulu] Fast Greedy MAP Inference for Determinantal Point Process to Improve Recommendation Diversity.pdf",year:2018,id:302},{tag:["Re-Rank"],name:"[2020][LinkedIn] Ads Allocation in Feed via Constrained Optimization",category:"Re-Rank",authors:[],company:"LinkedIn",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Re-Rank/[2020][LinkedIn] Ads Allocation in Feed via Constrained Optimization.pdf",year:2020,id:303},{tag:["Reinforce"],name:"Jointly Learning to Recommend and Advertise",category:"Reinforce",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Reinforce/Jointly Learning to Recommend and Advertise.pdf",year:1900,id:304},{tag:["Reinforce"],name:"Reinforcement Learning for Slate-based Recommender Systems - A Tractable Decomposition and Practical Methodology",category:"Reinforce",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Reinforce/Reinforcement Learning for Slate-based Recommender Systems - A Tractable Decomposition and Practical Methodology.pdf",year:1900,id:305},{tag:["Reinforce"],name:"Top-K Off-Policy Correctionfor a REINFORCE Recommender System",category:"Reinforce",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Reinforce/Top-K Off-Policy Correctionfor a REINFORCE Recommender System.pdf",year:1900,id:306},{tag:["Cold-Start","Exploration&Exploitation"],name:"A Contextual-Bandit Approach to Personalized News Article Recommendation",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Exploration&Exploitation/A Contextual-Bandit Approach to Personalized News Article Recommendation.pdf",year:1900,id:46},{tag:["Cold-Start","Exploration&Exploitation"],name:"Adversarial Gradient Driven Exploration for Deep Click-Through Rate Prediction",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Exploration&Exploitation/Adversarial Gradient Driven Exploration for Deep Click-Through Rate Prediction.pdf",year:1900,id:47},{tag:["Cold-Start","Exploration&Exploitation"],name:"An Empirical Evaluation of Thompson Sampling",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Exploration&Exploitation/An Empirical Evaluation of Thompson Sampling.pdf",year:1900,id:48},{tag:["Cold-Start","Exploration&Exploitation"],name:"Comparison-based Conversational Recommender System with Relative Bandit Feedback",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/Exploration&Exploitation/Comparison-based Conversational Recommender System with Relative Bandit Feedback.pdf",year:1900,id:49},{tag:["Cold-Start","MetaLearning"],name:"A Meta-Learning Perspective on Cold-Start Recommendations for Items",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/MetaLearning/A Meta-Learning Perspective on Cold-Start Recommendations for Items.pdf",year:1900,id:50},{tag:["Cold-Start","MetaLearning"],name:"Learning Graph Meta Embeddings for Cold-Start Ads in Click-Through Rate Prediction",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/MetaLearning/Learning Graph Meta Embeddings for Cold-Start Ads in Click-Through Rate Prediction.pdf",year:1900,id:51},{tag:["Cold-Start","MetaLearning"],name:"MeLU - Meta-Learned User Preference Estimator for Cold-Start Recommendation",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/MetaLearning/MeLU - Meta-Learned User Preference Estimator for Cold-Start Recommendation.pdf",year:1900,id:52},{tag:["Cold-Start","MetaLearning"],name:"Meta-Graph Based Recommendation Fusion over Heterogeneous Information Networks",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/MetaLearning/Meta-Graph Based Recommendation Fusion over Heterogeneous Information Networks.pdf",year:1900,id:53},{tag:["Cold-Start","MetaLearning"],name:"Meta-learning on Heterogeneous Information Networks for Cold-start Recommendation",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/MetaLearning/Meta-learning on Heterogeneous Information Networks for Cold-start Recommendation.pdf",year:1900,id:54},{tag:["Cold-Start","MetaLearning"],name:"Personalized Adaptive Meta Learning for Cold-start User Preference Prediction",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/MetaLearning/Personalized Adaptive Meta Learning for Cold-start User Preference Prediction.pdf",year:1900,id:55},{tag:["Cold-Start","MetaLearning"],name:"Preference-Adaptive Meta-Learning for Cold-Start Recommendation",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/MetaLearning/Preference-Adaptive Meta-Learning for Cold-Start Recommendation.pdf",year:1900,id:56},{tag:["Cold-Start","MetaLearning"],name:"Transfer-Meta Framework for Cross-domain Recommendation to Cold-Start Users",category:"Cold-Start",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Cold-Start/MetaLearning/Transfer-Meta Framework for Cross-domain Recommendation to Cold-Start Users.pdf",year:1900,id:57},{tag:["Industry","Bundle"],name:"Bundle Recommendation with Graph Convolutional Networks",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Bundle/Bundle Recommendation with Graph Convolutional Networks.pdf",year:1900,id:180},{tag:["Industry","Bundle"],name:"CrossCBR - Cross-view Contrastive Learning for Bundle Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Bundle/CrossCBR - Cross-view Contrastive Learning for Bundle Recommendation.pdf",year:1900,id:181},{tag:["Industry","Bundle"],name:"Hierarchical Fashion Graph Network for Personalized Outfit Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Bundle/Hierarchical Fashion Graph Network for Personalized Outfit Recommendation.pdf",year:1900,id:182},{tag:["Industry","Dataset"],name:"KuaiRand - An Unbiased Sequential Recommendation Dataset with Randomly Exposed Videos",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Dataset/KuaiRand - An Unbiased Sequential Recommendation Dataset with Randomly Exposed Videos.pdf",year:1900,id:183},{tag:["Industry","Dataset"],name:"KuaiRec - A Fully-observed Dataset and Insights for Evaluating Recommender Systems",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Dataset/KuaiRec - A Fully-observed Dataset and Insights for Evaluating Recommender Systems.pdf",year:1900,id:184},{tag:["Industry","Edge"],name:"Real-time Short Video Recommendation on Mobile Devices",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Edge/Real-time Short Video Recommendation on Mobile Devices.pdf",year:1900,id:185},{tag:["Industry","FeatureHashing"],name:"Compositional Embeddings Using Complementary Partitions for Memory-Efficient Recommendation Systems",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/FeatureHashing/Compositional Embeddings Using Complementary Partitions for Memory-Efficient Recommendation Systems.pdf",year:1900,id:186},{tag:["Industry","FeatureHashing"],name:"Feature Hashing for Large Scale Multitask Learning",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/FeatureHashing/Feature Hashing for Large Scale Multitask Learning.pdf",year:1900,id:187},{tag:["Industry","FeatureHashing"],name:"Getting Deep Recommenders Fit - Bloom Embeddings for Sparse Binary Input Output Networks",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/FeatureHashing/Getting Deep Recommenders Fit - Bloom Embeddings for Sparse Binary Input Output Networks.pdf",year:1900,id:188},{tag:["Industry","FeatureHashing"],name:"Hash Embeddings for Efficient Word Representations",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/FeatureHashing/Hash Embeddings for Efficient Word Representations.pdf",year:1900,id:189},{tag:["Industry","FeatureHashing"],name:"Model Size Reduction Using Frequency Based Double Hashing for Recommender Systems",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/FeatureHashing/Model Size Reduction Using Frequency Based Double Hashing for Recommender Systems.pdf",year:1900,id:190},{tag:["Industry","FeatureHashing"],name:"[2021][Google][DHE] Learning to Embed Categorical Features without Embedding Tables for Recommendation",category:"Industry",authors:[],company:"Google",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/FeatureHashing/[2021][Google][DHE] Learning to Embed Categorical Features without Embedding Tables for Recommendation.pdf",year:1900,id:191},{tag:["Industry","Intent"],name:"Automatically Discovering User Consumption Intents in Meituan",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Intent/Automatically Discovering User Consumption Intents in Meituan.pdf",year:1900,id:192},{tag:["Industry","Intent"],name:"FINN - Feedback Interactive Neural Network for Intent Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Intent/FINN - Feedback Interactive Neural Network for Intent Recommendation.pdf",year:1900,id:193},{tag:["Industry","Intent"],name:"Metapath-guided Heterogeneous Graph Neural Network for Intent Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Intent/Metapath-guided Heterogeneous Graph Neural Network for Intent Recommendation.pdf",year:1900,id:194},{tag:["Industry","POI"],name:"A Multi-Channel Next POI Recommendation Framework with Multi-Granularity Check-in Signals",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/A Multi-Channel Next POI Recommendation Framework with Multi-Granularity Check-in Signals.pdf",year:1900,id:195},{tag:["Industry","POI"],name:"A Survey on Deep Learning Based Point-Of-Interest (POI) Recommendations",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/A Survey on Deep Learning Based Point-Of-Interest (POI) Recommendations.pdf",year:1900,id:196},{tag:["Industry","POI"],name:"Empowering Next POI Recommendation with Multi-Relational Modeling",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/Empowering Next POI Recommendation with Multi-Relational Modeling.pdf",year:1900,id:197},{tag:["Industry","POI"],name:"Hierarchical Multi-Task Graph Recurrent Network for Next POI Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/Hierarchical Multi-Task Graph Recurrent Network for Next POI Recommendation.pdf",year:1900,id:198},{tag:["Industry","POI"],name:"LightMove - A Lightweight Next-POI Recommendation for Taxicab Rooftop Advertising",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/LightMove - A Lightweight Next-POI Recommendation for Taxicab Rooftop Advertising.pdf",year:1900,id:199},{tag:["Industry","POI"],name:"Modeling Spatio-temporal Neighbourhood for Personalized Point-of-interest Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/Modeling Spatio-temporal Neighbourhood for Personalized Point-of-interest Recommendation.pdf",year:1900,id:200},{tag:["Industry","POI"],name:"Next Point-of-Interest Recommendation with Inferring Multi-step Future Preferences",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/Next Point-of-Interest Recommendation with Inferring Multi-step Future Preferences.pdf",year:1900,id:201},{tag:["Industry","POI"],name:"Online POI Recommendation - Learning Dynamic Geo-Human Interactions in Streams",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/Online POI Recommendation - Learning Dynamic Geo-Human Interactions in Streams.pdf",year:1900,id:202},{tag:["Industry","POI"],name:"Point-of-Interest Recommender Systems based on Location-Based Social Networks - A Survey from an Experimental Perspective",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/Point-of-Interest Recommender Systems based on Location-Based Social Networks - A Survey from an Experimental Perspective.pdf",year:1900,id:203},{tag:["Industry","POI"],name:"POINTREC - A Test Collection for Narrative-driven Point of Interest Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/POINTREC - A Test Collection for Narrative-driven Point of Interest Recommendation.pdf",year:1900,id:204},{tag:["Industry","POI"],name:"TADSAM - A Time-Aware Dynamic Self-Attention Model for Next Point-of-Interest Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/TADSAM - A Time-Aware Dynamic Self-Attention Model for Next Point-of-Interest Recommendation.pdf",year:1900,id:205},{tag:["Industry","POI"],name:"Where to Go Next - Modeling Long- and Short-Term User Preferences for Point-of-Interest Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/Where to Go Next - Modeling Long- and Short-Term User Preferences for Point-of-Interest Recommendation.pdf",year:1900,id:206},{tag:["Industry","POI"],name:"Why We Go Where We Go - Profiling User Decisions on Choosing POIs",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/Why We Go Where We Go - Profiling User Decisions on Choosing POIs.pdf",year:1900,id:207},{tag:["Industry","POI"],name:"You Are What and Where You Are - Graph Enhanced Attention Network for Explainable POI Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/You Are What and Where You Are - Graph Enhanced Attention Network for Explainable POI Recommendation.pdf",year:1900,id:208},{tag:["Industry","POI","STGCN","Meituan"],name:"[2020][meituan][STGCN] STGCN - A Spatial-Temporal Aware Graph Learning Method for POI Recommendation",category:"Industry",authors:[],company:"Meituan",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/POI/[2020][meituan][STGCN] STGCN - A Spatial-Temporal Aware Graph Learning Method for POI Recommendation.pdf",year:2020,id:209},{tag:["Industry","Reciprocal"],name:"MATCHING THEORY-BASED RECOMMENDER SYSTEMS IN ONLINE DATING",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Reciprocal/MATCHING THEORY-BASED RECOMMENDER SYSTEMS IN ONLINE DATING.pdf",year:1900,id:210},{tag:["Industry","Regression"],name:"Deconfounding Duration Bias in Watch-time Prediction for Video Recommendation",category:"Industry",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Regression/Deconfounding Duration Bias in Watch-time Prediction for Video Recommendation.pdf",year:1900,id:211},{tag:["Industry","Representation","Pinterest"],name:"[2022][Pinterest][PinnerFormer] PinnerFormer - Sequence Modeling for User Representation at Pinterest",category:"Industry",authors:[],company:"Pinterest",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Industry/Representation/[2022][Pinterest][PinnerFormer] PinnerFormer - Sequence Modeling for User Representation at Pinterest.pdf",year:2022,id:212},{tag:["Learning-to-Rank","List-wise"],name:"AdaRank - A Boosting Algorithm for Information Retrieval",category:"Learning-to-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Learning-to-Rank/List-wise/AdaRank - A Boosting Algorithm for Information Retrieval.pdf",year:1900,id:213},{tag:["Learning-to-Rank","List-wise"],name:"From RankNet to LambdaRank to LambdaMART",category:"Learning-to-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Learning-to-Rank/List-wise/From RankNet to LambdaRank to LambdaMART.pdf",year:1900,id:214},{tag:["Learning-to-Rank","List-wise"],name:"LambdaMART - Adapting Boosting for Information Retrieval Measures",category:"Learning-to-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Learning-to-Rank/List-wise/LambdaMART - Adapting Boosting for Information Retrieval Measures.pdf",year:1900,id:215},{tag:["Learning-to-Rank","List-wise"],name:"ListNet - Learning to Rank - From Pairwise Approach to Listwise Approach",category:"Learning-to-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Learning-to-Rank/List-wise/ListNet - Learning to Rank - From Pairwise Approach to Listwise Approach.pdf",year:1900,id:216},{tag:["Learning-to-Rank","Pair-wise"],name:"LambdaRank - Learning to Rank with Nonsmooth Cost Functions",category:"Learning-to-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Learning-to-Rank/Pair-wise/LambdaRank - Learning to Rank with Nonsmooth Cost Functions.pdf",year:1900,id:217},{tag:["Learning-to-Rank","Pair-wise"],name:"RankBoost - An Effcient Boosting Algorithm for Combining Preferences",category:"Learning-to-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Learning-to-Rank/Pair-wise/RankBoost - An Effcient Boosting Algorithm for Combining Preferences.pdf",year:1900,id:218},{tag:["Learning-to-Rank","Pair-wise"],name:"RankNET - Learning to Rank Using Gradient Descent",category:"Learning-to-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Learning-to-Rank/Pair-wise/RankNET - Learning to Rank Using Gradient Descent.pdf",year:1900,id:219},{tag:["Learning-to-Rank","Point-wise"],name:"Learning to Rank Using Classification and Gradient",category:"Learning-to-Rank",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Learning-to-Rank/Point-wise/Learning to Rank Using Classification and Gradient.pdf",year:1900,id:220},{tag:["Match","Classic"],name:"Collaborative Filtering Recommender Systems",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Classic/Collaborative Filtering Recommender Systems.pdf",year:1900,id:259},{tag:["Match","Classic"],name:"GroupLens - An open architecture for collaborative filtering of Netnews",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Classic/GroupLens - An open architecture for collaborative filtering of Netnews.pdf",year:1900,id:260},{tag:["Match","Classic"],name:"Item-Based Collaborative Filtering Recommendation Algorithms",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Classic/Item-Based Collaborative Filtering Recommendation Algorithms.pdf",year:1900,id:261},{tag:["Match","GNN"],name:"ATBRG - Adaptive Target-Behavior Relational Graph Network for Effective Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/ATBRG - Adaptive Target-Behavior Relational Graph Network for Effective Recommendation.pdf",year:1900,id:262},{tag:["Match","GNN"],name:"Attentional Graph Convolutional Networks for Knowledge Concept Recommendation in MOOCs in a Heterogeneous View",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Attentional Graph Convolutional Networks for Knowledge Concept Recommendation in MOOCs in a Heterogeneous View.pdf",year:1900,id:263},{tag:["Match","GNN"],name:"Debiasing Neighbor Aggregation for Graph Neural Network in Recommender Systems",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Debiasing Neighbor Aggregation for Graph Neural Network in Recommender Systems.pdf",year:1900,id:264},{tag:["Match","GNN"],name:"Decoupled Graph Convolution Network for Inferring Substitutable and Complementary Items",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Decoupled Graph Convolution Network for Inferring Substitutable and Complementary Items.pdf",year:1900,id:265},{tag:["Match","GNN"],name:"Disentangled Graph Collaborative Filtering",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Disentangled Graph Collaborative Filtering.pdf",year:1900,id:266},{tag:["Match","GNN"],name:"Embedding-based News Recommendationfor Millions of Users",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Embedding-based News Recommendationfor Millions of Users.pdf",year:1900,id:267},{tag:["Match","GNN"],name:"Explicit Semantic Cross Feature Learning via Pre-trained Graph Neural Networks for CTR Prediction",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Explicit Semantic Cross Feature Learning via Pre-trained Graph Neural Networks for CTR Prediction.pdf",year:1900,id:268},{tag:["Match","GNN"],name:"Friend Recommendations with Self-Rescaling Graph Neural Networks",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Friend Recommendations with Self-Rescaling Graph Neural Networks.pdf",year:1900,id:269},{tag:["Match","GNN"],name:"Graph Convolutional Matrix Completion",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Graph Convolutional Matrix Completion.pdf",year:1900,id:270},{tag:["Match","GNN"],name:"Graph Intention Network for Click-through Rate Prediction in Sponsored Search",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Graph Intention Network for Click-through Rate Prediction in Sponsored Search.pdf",year:1900,id:271},{tag:["Match","GNN"],name:"Graph Neural Network for Tag Ranking in Tag-enhanced Video Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Graph Neural Network for Tag Ranking in Tag-enhanced Video Recommendation.pdf",year:1900,id:272},{tag:["Match","GNN"],name:"Graph Neural Networks for Friend Ranking in Large-scale Social Platforms",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Graph Neural Networks for Friend Ranking in Large-scale Social Platforms.pdf",year:1900,id:273},{tag:["Match","GNN"],name:"Graph Neural Networks for Social Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Graph Neural Networks for Social Recommendation.pdf",year:1900,id:274},{tag:["Match","GNN"],name:"GraphSAIL - Graph Structure Aware Incremental Learning for Recommender Systems",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/GraphSAIL - Graph Structure Aware Incremental Learning for Recommender Systems.pdf",year:1900,id:275},{tag:["Match","GNN"],name:"IntentGC - a Scalable Graph Convolution Framework Fusing Heterogeneous Information for Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/IntentGC - a Scalable Graph Convolution Framework Fusing Heterogeneous Information for Recommendation.pdf",year:1900,id:276},{tag:["Match","GNN"],name:"metapath2vec - Scalable Representation Learning for Heterogeneous Networks",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/metapath2vec - Scalable Representation Learning for Heterogeneous Networks.pdf",year:1900,id:277},{tag:["Match","GNN"],name:"MMGCN - Multi-modal Graph Convolution Network for Personalized Recommendation of Micro-video",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/MMGCN - Multi-modal Graph Convolution Network for Personalized Recommendation of Micro-video.pdf",year:1900,id:278},{tag:["Match","GNN"],name:"Neighbor Interaction Aware Graph Convolution Networks for Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Neighbor Interaction Aware Graph Convolution Networks for Recommendation.pdf",year:1900,id:279},{tag:["Match","GNN"],name:"Network Embedding as Matrix Factorization - Unifying DeepWalk, LINE, PTE, and node2vec",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Network Embedding as Matrix Factorization - Unifying DeepWalk, LINE, PTE, and node2vec.pdf",year:1900,id:280},{tag:["Match","GNN"],name:"Package Recommendation with Intra- and Inter-Package Attention Networks",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Package Recommendation with Intra- and Inter-Package Attention Networks.pdf",year:1900,id:281},{tag:["Match","GNN"],name:"PinnerSage - Multi-Modal User Embedding Framework for Recommendations at Pinterest",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/PinnerSage - Multi-Modal User Embedding Framework for Recommendations at Pinterest.pdf",year:1900,id:282},{tag:["Match","GNN"],name:"ProNE - Fast and Scalable Network Representation Learning",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/ProNE - Fast and Scalable Network Representation Learning.pdf",year:1900,id:283},{tag:["Match","GNN"],name:"Representation Learning for Attributed Multiplex Heterogeneous Network",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Representation Learning for Attributed Multiplex Heterogeneous Network.pdf",year:1900,id:284},{tag:["Match","GNN"],name:"Revisiting Item Promotion in GNN-based Collaborative Filtering - A Masked Targeted Topological Attack Perspective",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Revisiting Item Promotion in GNN-based Collaborative Filtering - A Masked Targeted Topological Attack Perspective.pdf",year:1900,id:285},{tag:["Match","GNN"],name:"Self-supervised Graph Learning for Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Self-supervised Graph Learning for Recommendation.pdf",year:1900,id:286},{tag:["Match","GNN"],name:"Self-Supervised Hypergraph Transformer for Recommender Systems",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/Self-Supervised Hypergraph Transformer for Recommender Systems.pdf",year:1900,id:287},{tag:["Match","GNN"],name:"struc2vec - Learning Node Representations from Structural Identity",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/struc2vec - Learning Node Representations from Structural Identity.pdf",year:1900,id:288},{tag:["Match","GNN"],name:"SVD-GCN - A Simplified Graph Convolution Paradigm for Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/SVD-GCN - A Simplified Graph Convolution Paradigm for Recommendation.pdf",year:1900,id:289},{tag:["Match","GNN"],name:"TwHIN - Embedding the Twitter Heterogeneous Information Network for Personalized Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/TwHIN - Embedding the Twitter Heterogeneous Information Network for Personalized Recommendation.pdf",year:1900,id:290},{tag:["Match","GNN","DeepWalk"],name:"[2014][DeepWalk] DeepWalk - Online Learning of Social Representations",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2014][DeepWalk] DeepWalk - Online Learning of Social Representations.pdf",year:2014,id:291},{tag:["Match","GNN","word2vec"],name:"[2014][word2vec] Negative-Sampling Word-Embedding Method",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2014][word2vec] Negative-Sampling Word-Embedding Method.pdf",year:2014,id:292},{tag:["Match","GNN","Line"],name:"[2015][Microsoft][LINE] LINE - Large-scale Information Network Embedding",category:"Match",authors:[],company:"Microsoft",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2015][Microsoft][LINE] LINE - Large-scale Information Network Embedding.pdf",year:2015,id:293},{tag:["Match","GNN"],name:"[2016][item2vec] ITEM2VEC - NEURAL ITEM EMBEDDING FOR COLLABORATIVE FILTERING",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2016][item2vec] ITEM2VEC - NEURAL ITEM EMBEDDING FOR COLLABORATIVE FILTERING.pdf",year:2016,id:294},{tag:["Match","GNN"],name:"[2016][SDNE] Structural Deep Network Embedding",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2016][SDNE] Structural Deep Network Embedding.pdf",year:2016,id:295},{tag:["Match","GNN"],name:"[2016][Stanford][node2vec] node2vec - Scalable Feature Learning for Networks",category:"Match",authors:[],company:"Stanford",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2016][Stanford][node2vec] node2vec - Scalable Feature Learning for Networks.pdf",year:2016,id:296},{tag:["Match","GNN"],name:"[2016][word2vec] word2vec Parameter Learning Explained",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2016][word2vec] word2vec Parameter Learning Explained.pdf",year:2016,id:297},{tag:["Match","GNN"],name:"[2017][GCN] SEMI-SUPERVISED CLASSIFICATION WITH GRAPH CONVOLUTIONAL NETWORKS",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2017][GCN] SEMI-SUPERVISED CLASSIFICATION WITH GRAPH CONVOLUTIONAL NETWORKS.pdf",year:2017,id:298},{tag:["Match","GNN"],name:"[2017][Stanford][GraphSage] Inductive Representation Learning on Large Graphs",category:"Match",authors:[],company:"Stanford",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2017][Stanford][GraphSage] Inductive Representation Learning on Large Graphs.pdf",year:2017,id:299},{tag:["Match","GNN"],name:"[2018][Alibaba] Learning and Transferring IDs Representation in E-commerce",category:"Match",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2018][Alibaba] Learning and Transferring IDs Representation in E-commerce.pdf",year:2018,id:300},{tag:["Match","GNN"],name:"[2018][Alibaba][EGES] Billion-scale Commodity Embedding for E-commerce Recommendation in Alibaba",category:"Match",authors:[],company:"Alibaba",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2018][Alibaba][EGES] Billion-scale Commodity Embedding for E-commerce Recommendation in Alibaba.pdf",year:2018,id:301},{tag:["Match","GNN"],name:"[2018][Etsy] Learning Item-Interaction Embeddings for User Recommendations",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2018][Etsy] Learning Item-Interaction Embeddings for User Recommendations.pdf",year:2018,id:302},{tag:["Match","GNN"],name:"[2018][GAT] GRAPH ATTENTION NETWORKS",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2018][GAT] GRAPH ATTENTION NETWORKS.pdf",year:2018,id:303},{tag:["Match","GNN"],name:"[2018][Pinterest][PinSage] Graph Convolutional Neural Networks for Web-Scale Recommender Systems",category:"Match",authors:[],company:"Pinterest",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2018][Pinterest][PinSage] Graph Convolutional Neural Networks for Web-Scale Recommender Systems.pdf",year:2018,id:304},{tag:["Match","GNN"],name:"[2019][NGCF]Neural Graph Collaborative Filtering",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2019][NGCF]Neural Graph Collaborative Filtering.pdf",year:2019,id:305},{tag:["Match","GNN"],name:"[2019][SR-GNN] Session-based Recommendation with Graph Neural Networks",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2019][SR-GNN] Session-based Recommendation with Graph Neural Networks.pdf",year:2019,id:306},{tag:["Match","GNN"],name:"[2020][LightGCN] LightGCN - Simplifying and Powering Graph Convolution Network for Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/GNN/[2020][LightGCN] LightGCN - Simplifying and Powering Graph Convolution Network for Recommendation.pdf",year:2020,id:307},{tag:["Match","Mulit-Interset"],name:"Every Preference Changes Differently - Neural Multi-Interest Preference Model with Temporal Dynamics for Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Mulit-Interset/Every Preference Changes Differently - Neural Multi-Interest Preference Model with Temporal Dynamics for Recommendation.pdf",year:1900,id:308},{tag:["Match","Mulit-Interset"],name:"Improving Multi-Interest Network with Stable Learning",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Mulit-Interset/Improving Multi-Interest Network with Stable Learning.pdf",year:1900,id:309},{tag:["Match","Mulit-Interset"],name:"Multiple Interest and Fine Granularity Network for User Modeling",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Mulit-Interset/Multiple Interest and Fine Granularity Network for User Modeling.pdf",year:1900,id:310},{tag:["Match","Mulit-Interset"],name:"[2019][Alibaba][MIND] Multi-Interest Network with Dynamic Routing for Recommendation at Tmall",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Mulit-Interset/[2019][Alibaba][MIND] Multi-Interest Network with Dynamic Routing for Recommendation at Tmall.pdf",year:2019,id:311},{tag:["Match","Mulit-Interset"],name:"[2020][Alibaba][ComiRec] Controllable Multi-Interest Framework for Recommendation",category:"Match",authors:[],company:"",url:"https://github.com/tangxyw/RecSysPapers/blob/main/Match/Mulit-Interset/[2020][Alibaba][ComiRec] Controllable Multi-Interest Framework for Recommendation.pdf",year:2020,id:312}];

    /* src\routes\CategoryContent.svelte generated by Svelte v3.50.1 */
    const file$2 = "src\\routes\\CategoryContent.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (10:4) {#each selectedPaper as paper}
    function create_each_block(ctx) {
    	let papercard;
    	let t0;
    	let br0;
    	let t1;
    	let br1;
    	let current;

    	papercard = new PaperCard({
    			props: {
    				year: /*paper*/ ctx[2].year,
    				url: /*paper*/ ctx[2].url,
    				tagArray: /*paper*/ ctx[2].tag,
    				name: /*paper*/ ctx[2].name,
    				authorArray: /*paper*/ ctx[2].authors,
    				company: /*paper*/ ctx[2].company
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(papercard.$$.fragment);
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			br1 = element("br");
    			add_location(br0, file$2, 18, 8, 518);
    			add_location(br1, file$2, 19, 8, 532);
    		},
    		m: function mount(target, anchor) {
    			mount_component(papercard, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br1, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const papercard_changes = {};
    			if (dirty & /*selectedPaper*/ 1) papercard_changes.year = /*paper*/ ctx[2].year;
    			if (dirty & /*selectedPaper*/ 1) papercard_changes.url = /*paper*/ ctx[2].url;
    			if (dirty & /*selectedPaper*/ 1) papercard_changes.tagArray = /*paper*/ ctx[2].tag;
    			if (dirty & /*selectedPaper*/ 1) papercard_changes.name = /*paper*/ ctx[2].name;
    			if (dirty & /*selectedPaper*/ 1) papercard_changes.authorArray = /*paper*/ ctx[2].authors;
    			if (dirty & /*selectedPaper*/ 1) papercard_changes.company = /*paper*/ ctx[2].company;
    			papercard.$set(papercard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(papercard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(papercard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(papercard, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(10:4) {#each selectedPaper as paper}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let article;
    	let current;
    	let each_value = /*selectedPaper*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			article = element("article");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(article, file$2, 8, 0, 245);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(article, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selectedPaper*/ 1) {
    				each_value = /*selectedPaper*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(article, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let selectedPaper;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CategoryContent', slots, []);
    	let { cat = "All" } = $$props;
    	const writable_props = ['cat'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CategoryContent> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('cat' in $$props) $$invalidate(1, cat = $$props.cat);
    	};

    	$$self.$capture_state = () => ({ PaperCard, papers, cat, selectedPaper });

    	$$self.$inject_state = $$props => {
    		if ('cat' in $$props) $$invalidate(1, cat = $$props.cat);
    		if ('selectedPaper' in $$props) $$invalidate(0, selectedPaper = $$props.selectedPaper);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*cat*/ 2) {
    			$$invalidate(0, selectedPaper = cat == "All"
    			? papers
    			: papers.filter(p => p.category == cat));
    		}
    	};

    	return [selectedPaper, cat];
    }

    class CategoryContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { cat: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CategoryContent",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get cat() {
    		throw new Error("<CategoryContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cat(value) {
    		throw new Error("<CategoryContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\lib\Footer.svelte generated by Svelte v3.50.1 */

    const file$1 = "src\\lib\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let div;
    	let p;
    	let strong;
    	let t1;
    	let a0;
    	let t3;
    	let a1;
    	let t5;
    	let a2;
    	let t7;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			p = element("p");
    			strong = element("strong");
    			strong.textContent = "Bulma";
    			t1 = text(" by ");
    			a0 = element("a");
    			a0.textContent = "Jeremy Thomas";
    			t3 = text(". The source code is licensed\r\n        ");
    			a1 = element("a");
    			a1.textContent = "MIT";
    			t5 = text(". The website content\r\n        is licensed ");
    			a2 = element("a");
    			a2.textContent = "CC BY NC SA 4.0";
    			t7 = text(".");
    			add_location(strong, file$1, 3, 8, 89);
    			attr_dev(a0, "href", "https://jgthms.com");
    			add_location(a0, file$1, 3, 34, 115);
    			attr_dev(a1, "href", "http://opensource.org/licenses/mit-license.php");
    			add_location(a1, file$1, 4, 8, 200);
    			attr_dev(a2, "href", "http://creativecommons.org/licenses/by-nc-sa/4.0/");
    			add_location(a2, file$1, 5, 20, 307);
    			add_location(p, file$1, 2, 6, 76);
    			attr_dev(div, "class", "content has-text-centered");
    			add_location(div, file$1, 1, 4, 29);
    			attr_dev(footer, "class", "footer");
    			add_location(footer, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(div, p);
    			append_dev(p, strong);
    			append_dev(p, t1);
    			append_dev(p, a0);
    			append_dev(p, t3);
    			append_dev(p, a1);
    			append_dev(p, t5);
    			append_dev(p, a2);
    			append_dev(p, t7);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.50.1 */
    const file = "src\\App.svelte";

    // (20:3) <Route path="category/:cat" let:params>
    function create_default_slot_1(ctx) {
    	let categorycontent;
    	let current;

    	categorycontent = new CategoryContent({
    			props: { cat: /*params*/ ctx[0].cat },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(categorycontent.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(categorycontent, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const categorycontent_changes = {};
    			if (dirty & /*params*/ 1) categorycontent_changes.cat = /*params*/ ctx[0].cat;
    			categorycontent.$set(categorycontent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(categorycontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(categorycontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(categorycontent, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(20:3) <Route path=\\\"category/:cat\\\" let:params>",
    		ctx
    	});

    	return block;
    }

    // (19:2) <Router>
    function create_default_slot(ctx) {
    	let route;
    	let current;

    	route = new Route({
    			props: {
    				path: "category/:cat",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ params }) => ({ 0: params }),
    						({ params }) => params ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_changes = {};

    			if (dirty & /*$$scope, params*/ 3) {
    				route_changes.$$scope = { dirty, ctx };
    			}

    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(19:2) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let section1;
    	let menu;
    	let t4;
    	let section0;
    	let router;
    	let t5;
    	let footer;
    	let current;
    	menu = new Menu({ $$inline: true });

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "REC-SYS-PAPER";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Find papers in Recommendation area.";
    			t3 = space();
    			section1 = element("section");
    			create_component(menu.$$.fragment);
    			t4 = space();
    			section0 = element("section");
    			create_component(router.$$.fragment);
    			t5 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(h1, "class", "svelte-1tky8bj");
    			add_location(h1, file, 11, 1, 269);
    			add_location(p, file, 12, 1, 293);
    			attr_dev(main, "class", "svelte-1tky8bj");
    			add_location(main, file, 10, 0, 261);
    			attr_dev(section0, "class", "container columns");
    			add_location(section0, file, 17, 1, 391);
    			attr_dev(section1, "class", "section columns");
    			add_location(section1, file, 15, 0, 346);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, section1, anchor);
    			mount_component(menu, section1, null);
    			append_dev(section1, t4);
    			append_dev(section1, section0);
    			mount_component(router, section0, null);
    			insert_dev(target, t5, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(section1);
    			destroy_component(menu);
    			destroy_component(router);
    			if (detaching) detach_dev(t5);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Menu,
    		Router,
    		Link,
    		Route,
    		CategoryContent,
    		Footer
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	// props: {
    	// 	name: 'world'
    	// }
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
