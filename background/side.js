/***
 *
 * @author Fabio Mereu
 *
 * @description Side Popup Script
 *
 **/


"use strict";

const REFRESH_MS = 1000; // 1 second

const SHOWN = "shown";
const COLLAPSE = "collapse";

const sendMessageToActiveTab = async message => {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(
                tabs[0].id,
                message,
                null,
                response => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError)
                    }
                    else {
                        resolve(response);
                    }
            });
        });
    });
};

const sectionInside = document.querySelector("section#inside");
const sectionOutside = document.querySelector("section#outside");

const form = sectionInside.querySelector("form");

const fieldsetFilter = document.querySelector("fieldset[name=filter]");
const checkFilter = document.querySelector("input[name=useFilter]");

const spanCount = document.getElementById("count");
const spanFilteredCount = document.getElementById("filteredCount");
const spanFilteredOutCount = document.getElementById("filteredOutCount");

form.querySelectorAll("input[name]").forEach(input => {
    input.oninput = async () => {
        sendMessageToActiveTab({ onSetFilter: getInputs() })
            .then(payload => {
                updateStats(payload);
            })
            .catch(error => console.log(error))
        ;
    }
});



checkFilter.onclick = async () => adjustSwitches();

const adjustSwitches = () => {
    fieldsetFilter.classList.toggle(COLLAPSE, !checkFilter.checked);
};

const setInputs = data => {
    form.querySelectorAll(`input[name]`).forEach(input => {
        const value = data[input.name];
        switch(input.type) {
            case "checkbox":
                input.checked = value;
                break;
            case "radio":
                input.checked = input.value === value;
                break;
            default:
                input.value = value || "";
        }
    });
};

const getInputs = () => {
    const dictionary = {};
    form.querySelectorAll(`input[name]`).forEach(input => {
        const { name } = input;
        switch(input.type) {
            case "checkbox":
                dictionary[name] = input.checked;
                break;
            case "radio":
                if (input.checked) {
                    dictionary[name] = input.value;
                }
                break;
            default:
                dictionary[name] = input.value || "";
        }
    });
    return dictionary;
};

const updateStats = (({ count, filteredCount } = {}) => {
    count = +count || 0;
    filteredCount = +filteredCount || 0;
    const filteredOutCount = count - filteredCount;
    spanCount.innerText = count;
    spanFilteredCount.innerText = filteredCount;
    spanFilteredOutCount.innerText = filteredOutCount;
});

const refresh = async () => {
    return sendMessageToActiveTab({ onGetFilter: true })
        .then(data => {
            setInputs(data);
            adjustSwitches();
            updateStats(data);
            sectionInside.classList.add(SHOWN);
            sectionOutside.classList.remove(SHOWN);
        })
        .catch(error => {
            sectionOutside.classList.add(SHOWN);
            sectionInside.classList.remove(SHOWN);
        })
    ;
};

refresh().finally(
    () => setInterval(refresh, REFRESH_MS)
);
