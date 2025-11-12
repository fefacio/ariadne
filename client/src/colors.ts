const clusterColorMap = new Map<number, string>();
const usedColors = new Set<string>();

const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B88B", "#AAB7B8",
    "#E74C3C", "#3498DB", "#2ECC71", "#F39C12", "#9B59B6",
    "#1ABC9C", "#E67E22", "#34495E", "#16A085", "#27AE60",
    "#2980B9", "#8E44AD", "#D35400", "#C0392B", "#BDC3C7",
];

export function getClusterColor(clusterId: number | undefined): string {
    if (clusterId === undefined) {
        return "#c9e792ff";
    }
    
    // Se já existe uma cor atribuída a este cluster, retorna ela
    if (clusterColorMap.has(clusterId)) {
        return clusterColorMap.get(clusterId)!;
    }
    
    // Encontra a primeira cor disponível
    for (const color of colors) {
        if (!usedColors.has(color)) {
            usedColors.add(color);
            clusterColorMap.set(clusterId, color);
            return color;
        }
    }
    
    // Generate random color
    let randomColor;
    do {
        randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    } while (usedColors.has(randomColor));
    
    usedColors.add(randomColor);
    clusterColorMap.set(clusterId, randomColor);
    return randomColor;
}

export function resetClusterColors() {
    clusterColorMap.clear();
    usedColors.clear();
}