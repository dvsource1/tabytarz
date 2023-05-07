import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import { analizeTabs } from "./actions/analizeTabs";
import { initStore } from "./store/initStore";
import { GroupConfig } from "./store/store";

reloadOnUpdate("pages/background");
reloadOnUpdate("pages/content/style.css");

/**
 * Your Code
 */
console.log("background loaded");

// Store
initStore();

const groups: GroupConfig[] = [
  {
    host: "web.whatsapp.com",
    tabGroup: { title: "fb", color: "blue" },
  },
  {
    host: "www.facebook.com",
    tabGroup: { title: "fb", color: "cyan" },
  },
  {
    host: "www.binance.com",
    tabGroup: { title: "$", color: "orange" },
  },
  {
    host: "www.youtube.com",
    tabGroup: {
      title: "yt",
      color: "red",
    },
  },
];

// Listners
// tabListener(handleTabChange({ groups }));

// chrome.storage.local.get("groups").then((groups) => console.log(groups));
chrome.action.onClicked.addListener(analizeTabs({ groups }));
