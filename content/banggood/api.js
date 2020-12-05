/***
 *
 * @author Fabio Mereu
 *
 * @description Banggood API
 *
 **/


"use strict";

const bgGetLsin = href => [/p-(\d+)\.htm/.exec(href)].flat()[1];

const bgStringToByte = text => {
    const bytes = [];
    String(text || "")
        .split("")
        .map(char => char.charCodeAt())
        .forEach(char => {
            if (char >= 0x010000 && char <= 0x10ffff) {
                bytes.push(((char >> 18) & 0x07) | 0xf0);
                bytes.push(((char >> 12) & 0x3f) | 0x80);
                bytes.push(((char >> 6) & 0x3f) | 0x80);
                bytes.push((char & 0x3f) | 0x80);
            } else if (char >= 0x000800 && char <= 0x00ffff) {
                bytes.push(((char >> 12) & 0x0f) | 0xe0);
                bytes.push(((char >> 6) & 0x3f) | 0x80);
                bytes.push((char & 0x3f) | 0x80);
            } else if (char >= 0x000080 && char <= 0x0007ff) {
                bytes.push(((char >> 6) & 0x1f) | 0xc0);
                bytes.push((char & 0x3f) | 0x80);
            } else {
                bytes.push(char & 0xff);
            }
        });
    return bytes;
};

const bgEncrypt = text => {
    if (!(text && typeof text === "string")) {
        return "";
    }
    const rand = Math.floor(
        0x80 * Math.random()
    );
    const cryptoArray = [];
    let cryptoString = "";
    bgStringToByte(text)
        .forEach((byte, i) => {
            const cryptoDigit = ~((byte + rand) % 0x100);
            cryptoArray[i] = cryptoDigit;
            cryptoString += Math.abs(cryptoDigit).toString(0x10);
        });
    const lzCryptoString = LZString.compressToBase64(cryptoString);
    return encodeURIComponent(
        lzCryptoString.slice(0, 2) + "0".repeat(rand < 0x10) + rand.toString(0x10) + lzCryptoString.slice(2)
    );
};

const bgAttachEncrypt = text => `sq=${bgEncrypt(text)}`;

const bgApiGetProduct = async href => {

    const lsin = bgGetLsin(href);
    const productLocation = new URL(href); // https://www.banggood.com/-p-${lsin}.html?rmmds=search

    const getSearchValue = param => productLocation.searchParams.get(param);

    let data = "products_id=" + lsin;

    const warehouse = getSearchValue("cur_warehouse");
    if (warehouse) {
        data += "&warehouse=" + warehouse;
    };

    const country = getSearchValue("gmcCountry");
    if (country) {
        data += "&gmcCountry=" + country;
    }

    const dsb = getSearchValue("DsbqgBg23");
    if (dsb) {
        data += "&DsbqgBg23=" + dsb;
    }

    const serial = document // $("#snatch_serial_id").val(); // || window.snatch_serial_id;
        .getElementById("snatch_serial_id") && document
        .getElementById("snatch_serial_id").value
    ;
    if (serial) {
        data += "&snatch_serial_id=" + serial;
    }

    const apyEntry = new URL(
        "/load/product/ajaxProduct.html",
        document.location.origin
    );
    apyEntry.search = bgAttachEncrypt(data);

    const response = await fetch(apyEntry, {
        headers: {
            "x-requested-with": "XMLHttpRequest"
        }
    }).catch(error => console.log("fetch failure", error));

    const raw = await response.json()
        .catch(error => console.log("json failure", error))
    ;

    let { processingTime } = { ...raw };

    let processingLabel = document.createElement("SPAN");
        processingLabel.innerHTML = processingTime || "";
        processingLabel = processingLabel
            .innerText
            .replace(/[^\n|\S]/gm, " ") // non-breaking spaces
            .trim()
        ;
    ;

    const outofstock = !processingLabel;

    if (outofstock) {
        processingLabel = "Out of Stock";
    }

    else if (/in 24 hours/i.test(processingLabel)) {
        processingLabel = "24 hours";
    }

    else if (/Expected to ship before/i.test(processingLabel)) {
        processingLabel = processingLabel.replace(/Expected to ship before/i, "Before");
    }

    return {
        lsin,
        processingLabel,
        outofstock,
        href,
        raw
    };
};
