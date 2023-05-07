import {
  getMachineTabGroup,
  getMatchingGroupConfig,
} from "../helpers/tabsHelper";
import { TabAction, TabActionEvent } from "../listners/tabListner";
import { GroupConfig } from "../store/store";
import { _groupTab } from "./commonActions";

type IDepandencies = { groups: GroupConfig[] };

export const handleTabChange =
  (deps: IDepandencies) => (_: TabAction, e: TabActionEvent) => {
    console.log(_, e);
    const { groups } = deps;
    const { tab } = e;
    const config = getMatchingGroupConfig(tab, groups);
    if (config) {
      hangleTabGrouping(tab, config);
    }
  };

const hangleTabGrouping = async (tab: chrome.tabs.Tab, config: GroupConfig) => {
  const tabGroups = await chrome.tabGroups.query({});
  const tabGroup = getMachineTabGroup(config, tabGroups);

  if (tab.groupId !== tabGroup?.id) {
    handleTabOpration(async () => {
      await _groupTab(tab, tabGroup, config);
    });
  }
};

const handleTabOpration = async (opration: () => void) => {
  try {
    await opration();
  } catch (err) {
    if (
      err ==
      "Error: Tabs cannot be edited right now (user may be dragging a tab)."
    ) {
      setTimeout(() => handleTabOpration(opration), 50);
      return;
    }
  }
};
