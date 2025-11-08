export function getClusterColor(clusterId: number | undefined): string {
    if (clusterId === undefined) {
        return "#c9e792ff"; // Cor padrão (sem cluster)
    }
    
    // Paleta de cores para clusters
    const colors = [
        "#FF6B6B", // Vermelho
        "#4ECDC4", // Turquesa
        "#45B7D1", // Azul
        "#FFA07A", // Salmão
        "#98D8C8", // Verde água
        "#F7DC6F", // Amarelo
        "#BB8FCE", // Roxo
        "#85C1E2", // Azul claro
        "#F8B88B", // Laranja
        "#AAB7B8", // Cinza
    ];
    
    return colors[clusterId % colors.length];
}