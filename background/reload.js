/***
 *
 * @author Fabio Mereu
 *
 * @description Autoreload pages to allow immediate side popup messaging
 *
 **/


"use strict";

chrome.tabs.query(
    {
        url: [ "https://*.banggood.com/*", "https://*.banggood.in/*" ]
    },
    tabs => tabs.forEach(({ id }) => chrome.tabs.reload(id))
);
