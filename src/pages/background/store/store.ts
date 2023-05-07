export interface GroupConfig {
  host: string;
  key?: string;
  tabGroup?: { title: string; color: chrome.tabGroups.ColorEnum | "" };
}

export const ROOT_STORE = {
  lang: "en",
  groups: [
    {
      host: "chrome.com",
    },
    {
      host: "binance.com",
    },
  ],
};
