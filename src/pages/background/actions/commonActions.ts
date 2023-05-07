import { GroupConfig } from "../store/store";

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
