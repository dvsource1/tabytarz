import {
  getMachineTabGroup,
  getMatchingGroupConfig,
  getTabGroupConfig,
  matchTabWithGroupConfig,
} from "@src/util/tabAndTabGroupUtils";
import { filter, forEach, isEmpty, map } from "lodash";
import { GroupConfig } from "../store/store";

type IDepandencies = { groups: GroupConfig[] };

export const analizeTabs = (deps: IDepandencies) => async () => {
  const { groups } = deps;

  console.log(groups);
  _attachGroupKeys(groups);

  // merge duplicate groups
  await _mergeDuplicateGroups();

  // check groups & ungroup mismatchin tabs
  await _ungroupMismatchingTabs(groups);

  // group tabs without groups to matching ones
  await _groupMatchingTabs(groups);

  // sort tabs
  _sortTabGroupsAndRest(groups);
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

  console.log(tabGroups);
  forEach(tabGroups, async (tabGroup) => {
    const groupConfig = getTabGroupConfig(groupConfigs, tabGroup);
    console.log(groupConfig);
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
  const allTabs = await chrome.tabs.query({});
  const tabsWithoutGroups = await chrome.tabs.query({
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
  });
  console.log("allTabs", allTabs);
  console.log("tabsWithoutGroups", tabsWithoutGroups);
  const tabGroups = await chrome.tabGroups.query({});

  forEach(tabsWithoutGroups, async (tab) => {
    const groupConfig = getMatchingGroupConfig(tab, groupConfigs);
    if (groupConfig) {
      const tabGroup = getMachineTabGroup(groupConfig, tabGroups);
      const tabGroupId = await chrome.tabs.group({
        groupId: tabGroup?.id,
        tabIds: [tab.id],
      });
      if (tabGroupId !== tabGroup?.id) {
        // new tab group created
        await chrome.tabGroups.update(tabGroupId, {
          color: groupConfig
            ? (groupConfig.tabGroup.color as chrome.tabGroups.ColorEnum)
            : "grey",
          title: groupConfig ? groupConfig.tabGroup.title : "",
        });
      }
    }
  });
};

const _sortTabGroupsAndRest = async (groupConfigs: GroupConfig[]) => {
  //
};
