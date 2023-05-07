export interface GroupConfig {
  host: string;
  key?: string;
  matcher?: (url: string) => boolean;
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
