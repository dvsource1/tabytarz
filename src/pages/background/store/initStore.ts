import { forEach } from "lodash";
import { ROOT_STORE } from "./store";

export const initStore = () => {
  const rootStore = ROOT_STORE;

  forEach(rootStore, async (value, key) => {
    await chrome.storage.local.set({ [key]: value });
  });
};
