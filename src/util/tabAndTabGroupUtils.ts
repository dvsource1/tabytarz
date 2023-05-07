import { GroupConfig } from "@src/pages/background/store/store";
import { find, isString } from "lodash";

export const getTabGroupConfig = (
  groups: GroupConfig[],
  tabGroupOrHost: chrome.tabGroups.TabGroup | string
): GroupConfig | undefined =>
  !isString(tabGroupOrHost)
    ? find(groups, matchTabGroupAndGroupConfig(tabGroupOrHost))
    : find(groups, matchHostUrlAndGroupConfig(tabGroupOrHost));

export const matchTabGroupAndGroupConfig =
  (tabGroup: chrome.tabGroups.TabGroup) =>
  (group: GroupConfig): boolean => {
    return (
      tabGroup.color === group.tabGroup?.color &&
      tabGroup.title === group.tabGroup?.title
    );
  };

export const matchHostUrlAndGroupConfig =
  (host: string) =>
  (group: GroupConfig): boolean => {
    return group.host === host;
  };

export const getHostFromUrl = (url: string) => {
  const orlO = new URL(url);
  console.log(orlO.host);
  return orlO.host;
};

export const getMatchingGroupConfig = (
  tab: chrome.tabs.Tab,
  configs: GroupConfig[]
): GroupConfig | undefined => {
  return find(configs, (config) => matchTabWithGroupConfig(tab, config));
};

export const getMachineTabGroup = (
  config: GroupConfig,
  tabGroups: chrome.tabGroups.TabGroup[]
): chrome.tabGroups.TabGroup | undefined => {
  return find(tabGroups, (tabGroup) =>
    matchTabGroupAndGroupConfig(tabGroup)(config)
  );
};

export const matchTabWithGroupConfig = (
  tab: chrome.tabs.Tab,
  config: GroupConfig
) => {
  const host = getHostFromUrl(tab.url);
  return matchHostUrlAndGroupConfig(host)(config);
};
