export const Modes = {
    SELECT: "SELECT",
    ADD_NODE: "ADD_NODE", 
    ADD_EDGE: "ADD_EDGE",
    DELETE: "DELETE",
    EDIT: "EDIT",
    DELETE_GRAPH: "DELETE_GRAPH"
} as const;

export type Mode = typeof Modes[keyof typeof Modes]


export const NodeTypes = {
    NORMAL: "NORMAL",
    FACILITY: "FACILITY",
    CONSUMER: "CONSUMER" 
} as const;

export type NodeType = typeof NodeTypes[keyof typeof NodeTypes]

export const MenuTypes = {
    MENU_DRAW: "MENU_DRAW",
    MENU_GENERATE: "MENU_GENERATE",
    MENU_EDIT_NODE: "MENU_EDIT_NODE"
} as const;

export type MenuType = typeof MenuTypes[keyof typeof MenuTypes]

export type Position = {
    x: number,
    y: number
}