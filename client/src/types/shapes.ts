export interface Circle {
    type: 'circle';
    x: number;
    y: number;
    radius: number;
}

export interface Rectangle {
    type: 'rectangle';
    x: number;
    y: number;
    width: number;
    height: number;
}

export type Shape = Circle | Rectangle;
