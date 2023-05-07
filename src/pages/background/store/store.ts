export interface GroupConfig {
  host: string;
  key?: string;
  matcher?: (url: string) => boolean;
  options?: { collapse?: boolean };
  tabGroup?: { title: string; color: chrome.tabGroups.ColorEnum | "" };
}

export const ROOT_STORE: { groups: GroupConfig[] } = {
  groups: [
    {
      host: "web.whatsapp.com",
      matcher: (url: string) => {
        const urlo = new URL(url);
        return urlo.host === "web.whatsapp.com";
      },
      options: { collapse: true },
      tabGroup: { title: "wa", color: "green" },
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
      options: { collapse: true },
      tabGroup: {
        title: "yt",
        color: "red",
      },
    },
  ],
};
