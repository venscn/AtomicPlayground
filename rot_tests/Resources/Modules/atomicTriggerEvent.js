/*eslint no-var:0*/

/**
 * Calling this will walk the components in the provided node and if the component has the eventName as function
 * on it, will call it.  Ideally, this will be replaced by the native Atomic sendEvent/subscribeToEvent, but this works for now.
 * Additionally, if a component has a function called "onAny", that will be called with the event name
 * @method
 * @param {Node} node the node to trigger the event on
 * @param {string} eventName the name of the event to call
 * @param {Any} args arguments to pass on through to the event handler
 * @return {Array} an array of all the results, if there are any, otherwise an empty array
 */
function trigger(node, eventName) {
    var components = node.getComponents('JSComponent');
    var results = [];
    var args = Array.prototype.slice.call(arguments, 2);
    var argsAny = Array.prototype.slice.call(arguments, 2).unshift(eventName);
    for (var c = 0, cLen = components.length; c < cLen; c++) {
        var component = components[c];
        var r;

        // Look for the named event
        if (component && typeof component[eventName] === 'function') {
            r = component[eventName].apply(component, args);
        }

        // See if there is an "onAny" event
        if (component && typeof component['onAny'] === 'function') {
            r = component[eventName].apply(component, argsAny);
        }

        // Capture the results
        if (typeof (r) !== 'undefined') {
            results.push(r);
        }
    }
    return results;
}

module.exports.trigger = trigger;
