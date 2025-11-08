export interface NodeStyle {
    fill: string;
    stroke: string;
    strokeWidth: number;
}

export const NODE_STYLES = {
    DEFAULT: {
        fill: "#c9e792ff",
        stroke: "black",
        strokeWidth: 2
    },
    DRAGGING: {
        fill: "#c9e792ff",
        stroke: "red",
        strokeWidth: 3
    },
    EDITING: {
        fill: "#c9e792ff",
        stroke: "blue",
        strokeWidth: 3
    },
    SELECTING: {
        fill: "#c9e792ff",
        stroke: "orange",
        strokeWidth: 3
    },
    SEARCH: {
        fill: "#9aeeffff",
        stroke: "black",
        strokeWidth: 3
    }
} as const;

export interface EdgeStyle {
    stroke: string;
    strokeWidth: number;
}

export const INNER_EDGE_STYLES = {
    DEFAULT: {
        stroke: "black",
        strokeWidth: 4
    },
    EDITING: {
        stroke: "blue",
        strokeWidth: 3
    },
    SEARCHING: {
        stroke: "#0096b4ff",
        strokeWidth: 3
    },
} as const;

export const OUTER_EDGE_STYLES = {
    DEFAULT: {
        stroke: "red",
        strokeWidth: 16
    },
    EDITING: {
        stroke: "blue",
        strokeWidth: 16
    },
    SEARCHING: {
        stroke: "#2fdcfeff",
        strokeWidth: 16
    },
} as const;