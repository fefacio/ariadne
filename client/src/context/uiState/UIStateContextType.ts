import type { MenuType, SvgMode } from "../../types";
import type { OpenMenu, OpenMenuMetadata } from "./UIStateProvider";

export interface UIStateContextType {
    currentMode: SvgMode;
    openMenuList: OpenMenu[];
    
    setMode: (mode: SvgMode) => void;
    addMenu: (menu: MenuType, metadata?: OpenMenuMetadata) => void;
    deleteMenu: (menu: MenuType) => void;
    clearMenus: () => void;
    isMenuOpen: (menu: MenuType) => boolean;
    getMenuMetadata: (menu: MenuType) => OpenMenuMetadata | undefined;
    selectingNodeFor: "source" | "target" | "stats" | null;
    setSelectingNodeFor: (type: "source" | "target" | "stats" | null) => void;
}