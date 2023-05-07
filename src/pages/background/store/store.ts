export interface GroupConfig {
  host?: string;
  key?: string;
  matcher?: (url: string) => boolean;
  options?: { collapse?: boolean };
  tabGroup?: { title: string; color: chrome.tabGroups.ColorEnum | "" };
}

export const ROOT_STORE: { groups: GroupConfig[] } = {
  groups: [
    {
      matcher: (url: string) => {
        const urlo = new URL(url);
        return urlo.host === "app.slack.com" || urlo.host === "mail.google.com";
      },
      tabGroup: { title: "#", color: "green" },
    },
    {
      matcher: (url: string) => {
        const urlo = new URL(url);
        return urlo.host === "127.0.0.1:8000";
      },
      tabGroup: { title: "l", color: "grey" },
    },
    {
      matcher: (url: string) => {
        const urlo = new URL(url);
        return urlo.host === "dev6.matific.com";
      },
      tabGroup: { title: "d6", color: "purple" },
    },
    {
      matcher: (url: string) => {
        const urlo = new URL(url);
        return urlo.host === "staging.matific.com";
      },
      tabGroup: { title: "stg", color: "cyan" },
    },
    {
      matcher: (url: string) => {
        const urlo = new URL(url);
        return urlo.host === "matific.com";
      },
      tabGroup: { title: "prod", color: "orange" },
    },
    {
      matcher: (url: string) => {
        const urlo = new URL(url);
        return urlo.host === "slatescience.atlassian.net";
      },
      options: { collapse: true },
      tabGroup: { title: "jira", color: "blue" },
    },
    {
      matcher: (url: string) => {
        const urlo = new URL(url);
        return urlo.host === "github.com";
      },
      options: { collapse: true },
      tabGroup: { title: "git", color: "green" },
    },
    {
      matcher: (url: string) => {
        const urlo = new URL(url);
        return (
          urlo.host === "www.binance.com" || urlo.host === "p2p.binance.com"
        );
      },
      options: { collapse: true },
      tabGroup: { title: "$", color: "yellow" },
    },
    {
      matcher: (url: string) => {
        const urlo = new URL(url);
        return ["web.whatsapp.com", "www.facebook.com"].includes(urlo.host);
      },
      options: { collapse: true },
      tabGroup: { title: "[0]", color: "cyan" },
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
