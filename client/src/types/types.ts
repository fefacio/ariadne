export const Modes = {
    SELECT: "SELECT",
    ADD_NODE: "ADD_NODE", 
    ADD_EDGE: "ADD_EDGE",
    DELETE: "DELETE",
    EDIT: "EDIT",
    RESET: "RESET",
    DELETE_GRAPH: "DELETE_GRAPH",
    SELECT_NODE: "SELECT_NODE"
} as const;

export type Mode = typeof Modes[keyof typeof Modes]


export const NodeTypes = {
    NORMAL: "NORMAL",
    FACILITY: "FACILITY",
    CONSUMER: "CONSUMER" 
} as const;

export type NodeType = typeof NodeTypes[keyof typeof NodeTypes]

export const MenuTypes = {
    MENU_HELLO: "MENU_HELLO",
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
    MENU_PMEDIAN: "MENU_PMEDIAN"
} as const;

export type MenuType = typeof MenuTypes[keyof typeof MenuTypes]

export type Position = {
    x: number,
    y: number
}
