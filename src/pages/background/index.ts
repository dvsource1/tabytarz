import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import { analizeTabs } from "./actions/analizeTabs";
import { initStore } from "./store/initStore";
import { GroupConfig, ROOT_STORE } from "./store/store";

reloadOnUpdate("pages/background");
reloadOnUpdate("pages/content/style.css");

/**
 * Your Code
 */
console.log("background loaded");

// Store
initStore();

const groups: GroupConfig[] = ROOT_STORE.groups;

// Listners
// tabListener(handleTabChange({ groups }));

// chrome.storage.local.get("groups").then((groups) => console.log(groups));
chrome.action.onClicked.addListener(analizeTabs({ groups }));
