import { GroupConfig } from "../store/store";
import { getMachineTabGroup } from "../helpers/tabsHelper";
import { forEach, reverse, some } from "lodash";

export const _groupTab = async (
  tab: chrome.tabs.Tab,
  tabGroup: chrome.tabGroups.TabGroup,
  config: GroupConfig
) => {
  const tabGroupId = await chrome.tabs.group({
    groupId: tabGroup?.id,
    tabIds: [tab.id],
  });
  if (tabGroupId !== tabGroup?.id) {
    // new tab group created
    await chrome.tabGroups.update(tabGroupId, {
      color: config
        ? (config.tabGroup.color as chrome.tabGroups.ColorEnum)
        : "grey",
      title: config ? config.tabGroup.title : "",
    });
  }
};

export const _sortAndCollapeTabGroups = async (groupConfigs: GroupConfig[]) => {
  const tabGroups = await chrome.tabGroups.query({});

  const _list: chrome.tabGroups.TabGroup[] = [];
  const _rest: chrome.tabGroups.TabGroup[] = [];

  forEach(groupConfigs, async (config) => {
    const tabGroup = getMachineTabGroup(config, tabGroups);
    if (tabGroup) {
      _list.push(tabGroup);
      await chrome.tabGroups.update(tabGroup.id, {
        collapsed: !!config.options?.collapse,
      });
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
