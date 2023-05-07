import {
  getMachineTabGroup,
  getMatchingGroupConfig,
  getTabGroupConfig,
  matchTabWithGroupConfig,
} from "@src/pages/background/helpers/tabsHelper";
import { filter, forEach, isEmpty, map, reverse, some } from "lodash";
import { GroupConfig } from "../store/store";
import { _groupTab } from "./commonActions";

type IDepandencies = { groups: GroupConfig[] };

export const analizeTabs = (deps: IDepandencies) => async () => {
  const { groups } = deps;

  _attachGroupKeys(groups);

  // merge duplicate groups
  await _mergeDuplicateGroups();

  // check groups & ungroup mismatchin tabs
  await _ungroupMismatchingTabs(groups);

  // group tabs without groups to matching ones
  await _groupMatchingTabs(groups);

  // sort tabs
  _sortAndCollapeTabGroups(groups);
};

const _attachGroupKeys = (groupConfigs: GroupConfig[]) => {
  forEach(groupConfigs, (config) => {
    const { tabGroup } = config;
    if (tabGroup) {
      config.key = `${tabGroup.color}#${tabGroup.title}`;
    }
  });
};

const _mergeDuplicateGroups = async () => {
  const tabGroups = await chrome.tabGroups.query({});
  const duplicateTabGroups = new Map<string, chrome.tabGroups.TabGroup[]>();
  // identify
  forEach(tabGroups, (tabGroup) => {
    const key = `${tabGroup.color}#${tabGroup.title}`;
    if (!duplicateTabGroups.has(key)) {
      duplicateTabGroups.set(key, []);
    }
    duplicateTabGroups.get(key).push(tabGroup);
  });
  forEach(Array.from(duplicateTabGroups), ([a, b]) => {
    if (b.length <= 1) {
      duplicateTabGroups.delete(a);
    }
  });

  forEach(Array.from(duplicateTabGroups.values()), (tabGroups) => {
    // const newTabGroup =
    const [firstTabGroup, ...restTabGroups] = tabGroups;
    forEach(restTabGroups, async (tabGroup) => {
      const tabs = await chrome.tabs.query({ groupId: tabGroup.id });
      await chrome.tabs.group({
        groupId: firstTabGroup.id,
        tabIds: [...map(tabs, "id")],
      });
    });
  });
};

const _ungroupMismatchingTabs = async (groupConfigs: GroupConfig[]) => {
  const tabGroups = await chrome.tabGroups.query({});

  const _matchTabWithGroupConfig =
    (groupConfig: GroupConfig) => (tab: chrome.tabs.Tab) =>
      !matchTabWithGroupConfig(tab, groupConfig);

  const _hasMatchingGroupConfig =
    (configs: GroupConfig[]) => (tab: chrome.tabs.Tab) =>
      !!getMatchingGroupConfig(tab, configs);

  forEach(tabGroups, async (tabGroup) => {
    const groupConfig = getTabGroupConfig(groupConfigs, tabGroup);
    const tabs = await chrome.tabs.query({ groupId: tabGroup.id });
    const matcher = groupConfig
      ? _matchTabWithGroupConfig(groupConfig)
      : _hasMatchingGroupConfig(groupConfigs);
    const tabIds = map(filter(tabs, matcher), "id");
    if (!isEmpty(tabIds)) {
      await chrome.tabs.ungroup(tabIds);
    }
  });
};

const _groupMatchingTabs = async (groupConfigs: GroupConfig[]) => {
  const tabsWithoutGroup = await chrome.tabs.query({
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
  });
  const tabGroups = await chrome.tabGroups.query({});

  forEach(tabsWithoutGroup, async (tab) => {
    const groupConfig = getMatchingGroupConfig(tab, groupConfigs);
    if (groupConfig) {
      const tabGroup = getMachineTabGroup(groupConfig, tabGroups);
      await _groupTab(tab, tabGroup, groupConfig);
    }
  });
};

const _sortAndCollapeTabGroups = async (groupConfigs: GroupConfig[]) => {
  const tabGroups = await chrome.tabGroups.query({});

  const _list: chrome.tabGroups.TabGroup[] = [];
  const _rest: chrome.tabGroups.TabGroup[] = [];

  forEach(groupConfigs, async (config) => {
    const tabGroup = getMachineTabGroup(config, tabGroups);
    if (tabGroup) {
      _list.push(tabGroup);
      if (config.options?.collapse) {
        await chrome.tabGroups.update(tabGroup.id, { collapsed: true });
      }
    }
  });

  forEach(tabGroups, (tabGroup) => {
    if (!some(_list, { id: tabGroup.id })) {
      _rest.push(tabGroup);
    }
  });

  // collapse rest groups
  forEach(_rest, async (tabGroup) => {
    await chrome.tabGroups.update(tabGroup.id, { collapsed: true });
  });

  const _final = [..._rest, ...reverse(_list)];

  forEach(_final, async (tabGroup) => {
    await chrome.tabGroups.move(tabGroup.id, { index: 0 });
  });

  const tabsWithoutGroup = await chrome.tabs.query({
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
  });

  tabsWithoutGroup.sort(function (a, b) {
    const aHostname = new URL(a.url).hostname;
    const bHostname = new URL(b.url).hostname;
    return aHostname.localeCompare(bHostname);
  });

  forEach(tabsWithoutGroup, async (tab) => {
    await chrome.tabs.move(tab.id, { index: -1 });
  });
};
