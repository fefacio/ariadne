import { useCallback } from "react";

// const useViewBoxCoordinates = (svgElement: SVGSVGElement | null, viewBox: {x: number, y:number, width:number, height:number} | DOMRect | undefined) => {
//     const getCoordinates = useCallback(
//         (event: MouseEvent | React.MouseEvent<SVGSVGElement>): {x:number, y:number} => {
//             if (!svgElement || !viewBox) return { x: 0, y: 0 };
            
//             const rect = svgElement.getBoundingClientRect();
//             const svgX = viewBox.x + (event.clientX - rect.left) * (viewBox.width / rect.width);
//             const svgY = viewBox.y + (event.clientY - rect.top) * (viewBox.height / rect.height);
            
//             return { x: svgX, y: svgY }
//         },
//         [svgElement, viewBox]
//     );

//     return getCoordinates;
// };


const useViewBoxCoordinates = (svgElement: SVGSVGElement | null) => {
    const getCoordinates = useCallback(
        (event: WheelEvent | MouseEvent | React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
            if (!svgElement) return { x: 0, y: 0 };

            const CTM = svgElement.getScreenCTM();
            if (!CTM) return { x: 0, y: 0 };

            return {
                x: (event.clientX - CTM.e) / CTM.a,
                y: (event.clientY - CTM.f) / CTM.d
            };
        },
        [svgElement]
    );

    return getCoordinates;
};

export default useViewBoxCoordinates;

