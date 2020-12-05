/***
 *
 * @author Fabio Mereu
 *
 * @description Merchant Filter Utils
 *
 **/


"use strict";

const CSS_BANGGOOD = "good-search-banggood";
const CSS_DISPLAY = "good-search-display";
const CSS_SOFT_FILTER = "good-search-soft-filter";
const CSS_HARD_FILTER = "good-search-hard-filter";
const CSS_ROOT = "good-search-root";
const CSS_BOX = "good-search-box";
const CSS_OUT_OF_STOCK = "good-search-out-of-stock";
const CSS_FILTERED = "good-search-filtered";
const CSS_SMALL = "good-search-small";

const sanitizeFilter = filter => {

    filter = { ...filter };

    // Booleans
    [
        { name: "useDisplay", defaulted: true },
        { name: "useFilter", defaulted: false },
        { name: "filterInstock", defaulted: true },
        { name: "filterOutofstock", defaulted: false }
    ].forEach(({ name, defaulted }) => {
        const value = filter[name];
        filter[name] = typeof value === "undefined"
            ? defaulted
            : !!value
        ;
    })

    // Text
    filter.filterKeyword = String(filter.filterKeyword || "");

    // Radio
    filter.filterHow = filter.filterHow === "hard"
        ? "hard"
        : "soft"
    ;

    return filter;
};

const matchKeyword = (keyword, text) => {
    text = String(text || "").toLowerCase();
    return String(keyword || "")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .every(keyword => text.includes(keyword))
    ;
}


const filterProduct = ({ goodSearchRoot, outofstock, keyword, href }) => {

    const {
        useFilter,
        filterInstock,
        filterOutofstock,
        filterKeyword
    } = filter;

    const filtered = !useFilter || useFilter && (
        (
            (filterInstock && !outofstock) ||
            (filterOutofstock && outofstock)
        ) &&
        (
            !filterKeyword || matchKeyword(filterKeyword, keyword || href)
        )
    );

    goodSearchRoot.classList.toggle(CSS_FILTERED, !!filtered);

    return filtered;
};
