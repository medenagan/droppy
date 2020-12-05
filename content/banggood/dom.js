/***
 *
 * @author Fabio Mereu
 *
 * @description Banggood Dom Enhancement
 *
 **/


"use strict";

const products = [];

let filter = sanitizeFilter(), filterProducts = [];

document.documentElement.classList.add(CSS_BANGGOOD);


const deployRoot = () => {

    const goodSearchRoots = document.querySelectorAll([
        "li[data-product-id]",
        ".warehouse-wrap ul.product li",
        "ul.goodlist li.product"
    ]);

    goodSearchRoots.forEach(async goodSearchRoot => {

        if (goodSearchRoot.classList.contains(CSS_ROOT)) {
            return;
        }

        goodSearchRoot.classList.add(CSS_ROOT);

        const anchors = goodSearchRoot.querySelectorAll("a[href*='-p-']");

        if (! anchors.length) {
            return;
        }

        const href = anchors[0].getAttribute("href");

        const title = [ ...anchors ]
            .map(a => a.getAttribute("title") || "")
            .sort(
                (a, b) => b.length - a.length
            )[0]
        ;

        const description = [ ...anchors ]
            .map(a => a.innerText)
            .sort(
                (a, b) => b.length - a.length
            )[0]
        ;

        const keyword = title + description;

        const { processingLabel, outofstock } = await bgApiGetProduct(href)
            .catch(error => console.log("bgApiGetProduct failure", error))
        ;

        const goodSearchBox = document.createElement("DIV");
        goodSearchBox.classList.add(CSS_BOX);
        goodSearchBox.classList.toggle(CSS_OUT_OF_STOCK, !!outofstock);
        goodSearchBox.classList.toggle(CSS_SMALL, processingLabel.length > 20);
        goodSearchBox.innerText = processingLabel;

        const product = {
            goodSearchRoot,
            goodSearchBox,
            processingLabel,
            outofstock,
            href,
            keyword,
            title,
            description
        };

        filterProduct(product);

        goodSearchRoot.prepend(goodSearchBox);

        products.push(product);

    });
};

const setProductFilter = newFilter => {

    console.log("setProductFilter", newFilter);

    if (newFilter) {
        filter = newFilter;
    }

    const { classList } = document.body;
    classList.toggle(CSS_DISPLAY, !!filter.useDisplay);
    classList.toggle(CSS_SOFT_FILTER, !!filter.useFilter && filter.filterHow !== "hard");
    classList.toggle(CSS_HARD_FILTER, !!filter.useFilter && filter.filterHow === "hard");

    return filterProducts = products.filter(
        product => filterProduct(product)
    );
};

const observer = new MutationObserver(deployRoot);
observer.observe(document.body, { childList: true, subtree: true });
deployRoot();

const ready = getDefaultFilter()
    .then(defaultFilter => {
        setProductFilter(defaultFilter);
    })
    .catch(error => console.log("getDefaultFilter failure", error))
;


browser.runtime.onMessage.addListener(async request => {

    const { onGetFilter, onSetFilter } = request;

    if (onGetFilter) {
        await ready;
        return {
            merchant: "banggood",
            count: products.length,
            filteredCount: filterProducts.length,
            ...filter
        };
    }

    else if (onSetFilter) {
        setProductFilter(onSetFilter);
        safeSetDefaultFilter(filter);
        return {
            count: products.length,
            filteredCount: filterProducts.length
        };
    }
});
