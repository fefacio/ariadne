import type { MenuType } from "../../types/types";
import type { OpenMenu, OpenMenuMetadata } from "./UIStateProvider";

export interface UIStateContextType {
  openMenuList: OpenMenu[];
  
  addMenu: (menu: MenuType, metadata?: OpenMenuMetadata) => void;
  deleteMenu: (menu: MenuType) => void;
  getMenuMetadata: (menu: MenuType) => OpenMenuMetadata | undefined;
}