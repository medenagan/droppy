/***
 *
 * @author Fabio Mereu
 *
 * @description Keep preferences persistent
 *
 **/


"use strict";

const getDefaultFilter = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get("defaultFilter", value => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
            }
            else {
                resolve(
                    sanitizeFilter(value.defaultFilter)
                );
            }
        });
    });
};

const setDefaultFilter = async value => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({defaultFilter: value}, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError)
            }
            else {
                resolve(null);
            }
        });
    })
};

// safe against MAX_WRITE_OPERATIONS_PER_MINUTE

const safeSetDefaultFilter = (() => {

    const WAIT = 2 * 1000; // 2 seconds

    let timer = null;

    return async value => {
        return new Promise(resolve => {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(async () => {
                resolve(
                    setDefaultFilter(value)
                );
            }, WAIT);
        });
    };
})();
