import { get, isNumber } from "lodash";

export type TabAction =
  | "create"
  | "attach"
  | "detach"
  | "move"
  | "remove"
  | "replace"
  | "update";

export type TabOrTabId = chrome.tabs.Tab | number;
export type TabInfo =
  | chrome.tabs.TabAttachInfo
  | chrome.tabs.TabRemoveInfo
  | chrome.tabs.TabDetachInfo
  | chrome.tabs.TabMoveInfo
  | chrome.tabs.TabChangeInfo;
export type TabInfoOrTabId = TabInfo | number;
export interface TabActionEvent {
  tab: chrome.tabs.Tab;
  info?: TabInfoOrTabId;
}

export const tabListener = (
  calback?: (action: TabAction, event: TabActionEvent) => void
) => {
  const tabAction =
    (action: TabAction) => async (e: TabOrTabId, info?: TabInfoOrTabId) => {
      const tab = isNumber(e) ? await chrome.tabs.get(e) : e;

      switch (action) {
        case "update":
          if (get(info, "status") === "loading") {
            calback(action, { tab, info });
          }
          break;
        default:
          calback(action, { tab, info });
          break;
      }
    };

  chrome.tabs.onCreated.addListener(tabAction("create"));
  chrome.tabs.onDetached.addListener(tabAction("detach"));
  chrome.tabs.onMoved.addListener(tabAction("move"));
  chrome.tabs.onRemoved.addListener(tabAction("remove"));
  chrome.tabs.onReplaced.addListener(tabAction("replace"));
  chrome.tabs.onAttached.addListener(tabAction("attach"));
  chrome.tabs.onUpdated.addListener(tabAction("update"));
};
