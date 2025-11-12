export const SvgModes = {
    SELECT: "SELECT",
    ADD_NODE: "ADD_NODE", 
    ADD_EDGE: "ADD_EDGE",
    DELETE: "DELETE",
    EDIT: "EDIT",
    SELECT_NODE: "SELECT_NODE"
} as const;

export type SvgMode = typeof SvgModes[keyof typeof SvgModes]


export const SvgActions = {
    RESET: "RESET",
    DELETE_GRAPH: "DELETE_GRAPH",
    CONFIG: "CONFIG"
}

export type SvgAction = typeof SvgActions[keyof typeof SvgActions]

export type SvgInteraction = SvgMode | SvgAction;

export type KeyboardAction = Exclude<SvgMode, "SELECT_NODE"> | SvgAction;

export function isSvgMode(value: SvgInteraction): value is SvgMode {
    return Object.values(SvgModes).includes(value as SvgMode);
}

export function isSvgAction(value: SvgInteraction): value is SvgAction {
    return Object.values(SvgActions).includes(value as SvgAction);
}

export const NodeTypes = {
    NORMAL: "NORMAL",
    FACILITY: "FACILITY",
    CONSUMER: "CONSUMER" 
} as const;

export type NodeType = typeof NodeTypes[keyof typeof NodeTypes]

export const MenuTypes = {
    MENU_DEBUG: "MENU_DEBUG",
    MENU_DRAW: "MENU_DRAW",
    MENU_GENERATE: "MENU_GENERATE",
    MENU_RANDOMIZER: "MENU_RANDOMIZER",
    MENU_EDIT_NODE: "MENU_EDIT_NODE",
    MENU_EDIT_EDGE: "MENU_EDIT_EDGE",
    MENU_RESET: "MENU_RESET",
    MENU_FILE_IO: "MENU_FILE_IO",
    MENU_SEARCH: "MENU_SEARCH",
    MENU_CLUSTER: "MENU_CLUSTER",
    MENU_STATS: "MENU_STATS",
    MENU_PMEDIAN: "MENU_PMEDIAN",
    MENU_REPORT: "MENU_REPORT",
    MENU_GLOBAL_CONFIG: "MENU_GLOBAL_CONFIG"
} as const;

export type MenuType = typeof MenuTypes[keyof typeof MenuTypes]

export type Position = {
    x: number,
    y: number
}
