import React, { useCallback, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { type MenuType } from "../../types/types";
import type { UIStateContextType } from "./UIStateContextType";
import { UIStateContext } from "./UIStateContext";

export interface OpenMenuMetadata {
    nodeId?: number;
    edgeId?: number;
}

export interface OpenMenu {
    id: number;
    type: MenuType;
    metadata?: OpenMenuMetadata;
};



export const UIStateProvider: React.FC<PropsWithChildren> = (props) => {
    //const [currentMode, setCurrentMode] = useState<Mode>(Modes.SELECT);
    const [openMenuList, setOpenMenuList] = useState<OpenMenu[]>([]);
    const [selectingNodeFor, setSelectingNodeFor] = useState<"source" | "target" | "stats" | null>(null);
    const menuId = useRef<number>(0);


    const addMenu = useCallback(
        (menu: MenuType, metadata?: OpenMenu["metadata"]) => {
            setOpenMenuList(prev => {
                const newMenu: OpenMenu = {
                    id: menuId.current,
                    type: menu,
                    metadata
                };
                menuId.current += 1;

                const existingIndex = prev.findIndex(m => m.type === menu);

                if (existingIndex !== -1) {
                    const updated = [...prev];
                    updated[existingIndex] = newMenu;
                    return updated;
                } else {
                    return [...prev, newMenu];
                }
            });
        },[]
    );


    const deleteMenu = useCallback((menu: MenuType) => {
        setOpenMenuList(prev => {
            if (prev.some(m => m.type === menu)) {
                return prev.filter(m => m.type !== menu);
            }
            return prev;
        });
    }, 
    []);

    const clearMenus = useCallback(() => {
        setOpenMenuList([]);
    }, []);

    const isMenuOpen = useCallback((menuType: MenuType): boolean => {
        return openMenuList.some(m => m.type === menuType);
    }, 
    [openMenuList]);

    const getMenuMetadata = useCallback((menuType: MenuType): OpenMenuMetadata | undefined => {
        const menu = openMenuList.find(m => m.type === menuType);
        return menu?.metadata;
    }, [openMenuList]);
    
    const uiStateContext: UIStateContextType = useMemo(() => ({
        openMenuList, 
        addMenu, 
        deleteMenu,
        clearMenus,
        isMenuOpen, 
        getMenuMetadata,
        selectingNodeFor,
        setSelectingNodeFor
    }), [openMenuList, addMenu, deleteMenu, clearMenus, isMenuOpen, getMenuMetadata, selectingNodeFor, setSelectingNodeFor]);

    return (
        <UIStateContext.Provider value={uiStateContext}>
            {props.children}
        </UIStateContext.Provider>
    )
}

