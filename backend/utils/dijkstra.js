export function calculateShortestPath(graph, startNode) {
    let distances = {};
    let visited = new Set();
    let nodes = Object.keys(graph);

    for (let node of nodes) {
        distances[node] = Infinity;
    }

    if (!nodes.includes(startNode)) {
        distances[startNode] = 0;
        for (let node of nodes) {
            if (node !== startNode) {
                distances[node] = 30; // default 30 mins travel time for unknown locations
            }
        }
    } else {
        distances[startNode] = 0;
    }

    let unvisited = new Set(Object.keys(distances));

    while (unvisited.size > 0) {
        let unvisitedArray = Array.from(unvisited);
        unvisitedArray.sort((a, b) => distances[a] - distances[b]);
        let closestNode = unvisitedArray[0];

        if (distances[closestNode] === Infinity) break;

        unvisited.delete(closestNode);
        visited.add(closestNode);

        let neighbors = (closestNode === startNode && !nodes.includes(startNode))
            ? Object.fromEntries(nodes.map(n => [n, 30]))
            : graph[closestNode];

        if (neighbors) {
            for (let neighbor in neighbors) {
                if (!visited.has(neighbor)) {
                    let newDistance = distances[closestNode] + neighbors[neighbor];
                    if (newDistance < distances[neighbor]) {
                        distances[neighbor] = newDistance;
                    }
                }
            }
        }
    }

    return distances;
}
