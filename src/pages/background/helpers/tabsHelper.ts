import { GroupConfig } from "@src/pages/background/store/store";
import { find, has } from "lodash";

export const getTabGroupConfig = (
  groups: GroupConfig[],
  tabGroup: chrome.tabGroups.TabGroup
): GroupConfig | undefined =>
  find(groups, matchTabGroupAndGroupConfig(tabGroup));

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

export const getHostFromUrl = (url: string): string => {
  try {
    const orlO = new URL(url);
    return orlO.host;
  } catch (e) {
    console.error("MYERR: getHostFromUrl", e);
    return null;
  }
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
): boolean => {
  if (has(config, "matcher")) {
    return config.matcher(tab.url);
  }

  const host = getHostFromUrl(tab.url);
  return matchHostUrlAndGroupConfig(host)(config);
};
