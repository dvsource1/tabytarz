import { find } from "lodash";
import { TabAction, TabActionEvent } from "../listners/tabListner";
import { GroupConfig } from "../store/store";

type IDepandencies = { groups: GroupConfig[] };

export const handleTabChange =
  (deps: IDepandencies) => (_: TabAction, e: TabActionEvent) => {
    console.log(_, e);
    const { groups } = deps;
    const { tab } = e;
    const { url } = tab;
    if (url) {
      const urlo = new URL(url);
      const { host } = urlo;
      console.log(host);
      const group = find(groups, { host });
      if (group && group.tabGroup) {
        // check if this tab already in the (correct) group
        hangleTabGrouping(tab, group);
      }
    }
  };

const hangleTabGrouping = (tab: chrome.tabs.Tab, group: GroupConfig) => {
  chrome.tabGroups.query({}, (tabGroups) => {
    console.log(tabGroups);

    // merge duplicate groups

    const tabGroup = find(tabGroups, (tabGroup) =>
      matchTabGroupAndGroupCOnfig(tabGroup, group)
    );
    console.log(tabGroup);
    if (tabGroup) {
      groupTab(tab, group, tabGroup.id);
    } else {
      groupTab(tab, group);
    }
  });
};

const groupTab = async (
  tab: chrome.tabs.Tab,
  group: GroupConfig,
  groupId?: number
) => {
  if (tab.groupId > -1) {
    const tabGroup = await chrome.tabGroups.get(tab.groupId);
    if (matchTabGroupAndGroupCOnfig(tabGroup, group)) {
      return;
    }
  }
  let newGroupId = null;
  try {
    newGroupId = await chrome.tabs.group({ tabIds: [tab.id], groupId });
  } catch (err) {
    if (
      err ==
      "Error: Tabs cannot be edited right now (user may be dragging a tab)."
    ) {
      setTimeout(() => groupTab(tab, group, groupId), 50);
      return;
    }
  }
  if (newGroupId && groupId !== newGroupId) {
    chrome.tabGroups.update(newGroupId, {
      title: group.tabGroup.title,
      color: group.tabGroup.color as chrome.tabGroups.ColorEnum,
    });
  }
};

const matchTabGroupAndGroupCOnfig = (
  tabGroup: chrome.tabGroups.TabGroup,
  group: GroupConfig
): boolean => {
  return (
    tabGroup.color === group.tabGroup?.color &&
    tabGroup.title === group.tabGroup?.title
  );
};
