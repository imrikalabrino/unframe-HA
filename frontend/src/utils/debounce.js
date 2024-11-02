/**
 * Creates a debounced function that delays invoking the provided function until
 * after the specified delay has elapsed since the last time the debounced function was called.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The number of milliseconds to delay.
 * @param {boolean} [immediate=false] - If `true`, trigger the function on the leading edge instead of the trailing.
 *
 * @returns {Function} - Returns the new debounced function.
 */
export function debounce(func, delay, immediate = false) {
    let timeout;

    return function(...args) {
        const callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(() => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        }, delay);

        if (callNow) func.apply(this, args);
    };
}
