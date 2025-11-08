import type { MenuType } from "../../types/types";
import type { OpenMenu, OpenMenuMetadata } from "./UIStateProvider";

export interface UIStateContextType {
  openMenuList: OpenMenu[];
  
  addMenu: (menu: MenuType, metadata?: OpenMenuMetadata) => void;
  deleteMenu: (menu: MenuType) => void;
  clearMenus: () => void;
  isMenuOpen: (menu: MenuType) => boolean;
  getMenuMetadata: (menu: MenuType) => OpenMenuMetadata | undefined;
  selectingNodeFor: "source" | "target" | "stats" | null;
  setSelectingNodeFor: (type: "source" | "target" | "stats" | null) => void;
}