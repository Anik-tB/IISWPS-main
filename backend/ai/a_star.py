"""
A* Search Algorithm
For safest escape route planning
"""

import heapq
from typing import List, Tuple, Dict, Set, Any
import math


class Node:
    """Node class for A* algorithm"""

    def __init__(self, x: int, y: int, g: float = 0, h: float = 0, parent=None):
        self.x = x
        self.y = y
        self.g = g  # Cost from start
        self.h = h  # Heuristic cost to goal
        self.f = g + h  # Total cost
        self.parent = parent

    def __lt__(self, other):
        return self.f < other.f

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

    def __hash__(self):  #for using Node in sets and as dict keys
        return hash((self.x, self.y))

    def __repr__(self): # String representation
        return f"Node({self.x}, {self.y}, f={self.f:.2f})"


class AStarPlanner:
    """A* path planner for escape routes"""

    def __init__(self):
        """Initialize A* planner"""
        pass

    def _heuristic(self, x1: int, y1: int, x2: int, y2: int) -> float:
        """
        Euclidean distance heuristic

        Args:
            x1, y1: Current position
            x2, y2: Goal position

        Returns:
            Estimated distance to goal
        """
        return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

    def _get_neighbors(self, node: Node, grid: List[List[int]], blocked: Set[Tuple[int, int]]) -> List[Tuple[int, int]]:
        """
        Get valid neighboring cells

        Args:
            node: Current node
            grid: Grid representation
            blocked: Set of blocked coordinates

        Returns:
            List of valid neighbor coordinates
        """
        neighbors = []
        rows = len(grid)
        cols = len(grid[0]) if rows > 0 else 0

        # 8-directional movement (including diagonals)
        directions = [
            (-1, -1), (-1, 0), (-1, 1),
            (0, -1),           (0, 1),
            (1, -1),  (1, 0),  (1, 1)
        ]
        # Explore all directions
        # Check each direction
        # If within bounds and not blocked, add to neighbors

        for dx, dy in directions:
            new_x = node.x + dx
            new_y = node.y + dy

            # Check bounds
            if 0 <= new_x < rows and 0 <= new_y < cols: # Check if within grid bounds
                # Check if not blocked
                if (new_x, new_y) not in blocked and grid[new_x][new_y] == 0:
                    neighbors.append((new_x, new_y))

        return neighbors # Return list of valid neighbors

    def _calculate_cost(self, x1: int, y1: int, x2: int, y2: int) -> float:
        """
        Calculate movement cost between two cells

        Args:
            x1, y1: From position
            x2, y2: To position

        Returns:
            Movement cost
        """
        dx = abs(x2 - x1)
        dy = abs(y2 - y1)

        # Diagonal movement costs more
        if dx == 1 and dy == 1:
            return 1.414  # sqrt(2)
        else:
            return 1.0

    def find_path(self, grid: List[List[int]], start: List[int], goal: List[int], blocked: List[List[int]] = None) -> Tuple[List[List[int]], float, int]:
        """
        Find path from start to goal using A* algorithm

        Args:
            grid: 2D grid (0=free, 1=obstacle)
            start: [x, y] start position
            goal: [x, y] goal position
            blocked: List of [x, y] blocked positions

        Returns:
            Tuple of (path, total_cost, path_length)
        """
        if blocked is None:
            blocked = []

        blocked_set = {(b[0], b[1]) for b in blocked}

        # Validate inputs
        rows = len(grid)
        if rows == 0:
            return [], float('inf'), 0

        cols = len(grid[0])
        start_x, start_y = start[0], start[1]
        goal_x, goal_y = goal[0], goal[1]

        # Validate positions
        if not (0 <= start_x < rows and 0 <= start_y < cols):
            return [], float('inf'), 0
        if not (0 <= goal_x < rows and 0 <= goal_y < cols):
            return [], float('inf'), 0
        if (start_x, start_y) in blocked_set or grid[start_x][start_y] == 1:
            return [], float('inf'), 0
        if (goal_x, goal_y) in blocked_set or grid[goal_x][goal_y] == 1:
            return [], float('inf'), 0

        # Initialize start node
        start_node = Node(start_x, start_y)
        start_node.h = self._heuristic(start_x, start_y, goal_x, goal_y)
        start_node.f = start_node.g + start_node.h

        # Open set (priority queue)
        open_set = [start_node]
        heapq.heapify(open_set)

        # Closed set (visited nodes)
        closed_set: Set[Tuple[int, int]] = set()

        # Track nodes for path reconstruction
        all_nodes: Dict[Tuple[int, int], Node] = {(start_x, start_y): start_node}

        while open_set:
            # Get node with lowest f score
            current = heapq.heappop(open_set)

            # Check if goal reached
            if current.x == goal_x and current.y == goal_y:
                # Reconstruct path
                path = []
                node = current
                while node is not None:
                    path.append([node.x, node.y])
                    node = node.parent
                path.reverse()
                return path, current.g, len(path) - 1

            # Add to closed set
            closed_set.add((current.x, current.y))

            # Explore neighbors
            neighbors = self._get_neighbors(current, grid, blocked_set)

            for nx, ny in neighbors:
                if (nx, ny) in closed_set:
                    continue

                # Calculate cost
                move_cost = self._calculate_cost(current.x, current.y, nx, ny)
                tentative_g = current.g + move_cost

                # Check if we've seen this node before
                if (nx, ny) in all_nodes:
                    neighbor_node = all_nodes[(nx, ny)]
                    if tentative_g >= neighbor_node.g:
                        continue  # Not a better path
                else:
                    # Create new node
                    neighbor_node = Node(nx, ny)
                    all_nodes[(nx, ny)] = neighbor_node

                # Update node
                neighbor_node.parent = current
                neighbor_node.g = tentative_g
                neighbor_node.h = self._heuristic(nx, ny, goal_x, goal_y)
                neighbor_node.f = neighbor_node.g + neighbor_node.h

                # Add to open set
                heapq.heappush(open_set, neighbor_node)

        # No path found
        return [], float('inf'), 0

    def find_path_with_risk(self, grid: List[List[int]], start: List[int], goal: List[int],
                           risk_map: List[List[float]] = None, blocked: List[List[int]] = None,
                           safety_weight: float = 0.5) -> Tuple[List[List[int]], float, float, int]:
        """
        Find path with risk-weighted cost (multi-objective optimization)

        Args:
            grid: 2D grid (0=free, 1=obstacle)
            start: [x, y] start position
            goal: [x, y] goal position
            risk_map: 2D grid with risk values (0.0 to 1.0) for each cell
            blocked: List of [x, y] blocked positions
            safety_weight: Weight for safety vs distance (0.0 = distance only, 1.0 = safety only)

        Returns:
            Tuple of (path, distance_cost, risk_cost, path_length)
        """
        if risk_map is None:
            # Default: no risk
            risk_map = [[0.0 for _ in range(len(grid[0]))] for _ in range(len(grid))]

        if blocked is None:
            blocked = []

        blocked_set = {(b[0], b[1]) for b in blocked}

        rows = len(grid)
        if rows == 0:
            return [], float('inf'), float('inf'), 0

        cols = len(grid[0])
        start_x, start_y = start[0], start[1]
        goal_x, goal_y = goal[0], goal[1]

        # Validate positions
        if not (0 <= start_x < rows and 0 <= start_y < cols):
            return [], float('inf'), float('inf'), 0
        if not (0 <= goal_x < rows and 0 <= goal_y < cols):
            return [], float('inf'), float('inf'), 0

        # Enhanced heuristic considering risk
        def risk_heuristic(x1: int, y1: int, x2: int, y2: int) -> float:
            base_dist = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
            # Add risk penalty
            avg_risk = (risk_map[x1][y1] + risk_map[x2][y2]) / 2 if 0 <= x1 < rows and 0 <= y1 < cols and 0 <= x2 < rows and 0 <= y2 < cols else 0.0
            risk_penalty = avg_risk * 10.0  # Scale risk impact
            return base_dist * (1 - safety_weight) + risk_penalty * safety_weight

        # Initialize start node
        start_node = Node(start_x, start_y)
        start_node.h = risk_heuristic(start_x, start_y, goal_x, goal_y)
        start_node.f = start_node.g + start_node.h

        open_set = [start_node]
        heapq.heapify(open_set)
        closed_set: Set[Tuple[int, int]] = set()
        all_nodes: Dict[Tuple[int, int], Node] = {(start_x, start_y): start_node}

        while open_set:
            current = heapq.heappop(open_set)

            if current.x == goal_x and current.y == goal_y:
                # Reconstruct path
                path = []
                node = current
                total_risk = 0.0
                while node is not None:
                    path.append([node.x, node.y])
                    if 0 <= node.x < rows and 0 <= node.y < cols:
                        total_risk += risk_map[node.x][node.y]
                    node = node.parent
                path.reverse()
                return path, current.g, total_risk, len(path) - 1

            closed_set.add((current.x, current.y))
            neighbors = self._get_neighbors(current, grid, blocked_set)

            for nx, ny in neighbors:
                if (nx, ny) in closed_set:
                    continue

                move_cost = self._calculate_cost(current.x, current.y, nx, ny)
                risk_cost = risk_map[nx][ny] * 10.0 if 0 <= nx < rows and 0 <= ny < cols else 0.0

                # Combined cost: distance + risk
                combined_cost = move_cost * (1 - safety_weight) + risk_cost * safety_weight
                tentative_g = current.g + combined_cost

                if (nx, ny) in all_nodes:
                    neighbor_node = all_nodes[(nx, ny)]
                    if tentative_g >= neighbor_node.g:
                        continue
                else:
                    neighbor_node = Node(nx, ny)
                    all_nodes[(nx, ny)] = neighbor_node

                neighbor_node.parent = current
                neighbor_node.g = tentative_g
                neighbor_node.h = risk_heuristic(nx, ny, goal_x, goal_y)
                neighbor_node.f = neighbor_node.g + neighbor_node.h

                heapq.heappush(open_set, neighbor_node)

        return [], float('inf'), float('inf'), 0

    def compare_routes(self, grid: List[List[int]], start: List[int], goal: List[int],
                      risk_map: List[List[float]] = None, blocked: List[List[int]] = None) -> Dict[str, Any]:
        """
        Compare multiple route options (shortest vs safest)

        Args:
            grid: 2D grid
            start: Start position
            goal: Goal position
            risk_map: Risk values for each cell
            blocked: Blocked positions

        Returns:
            Dictionary comparing different route strategies
        """
        # Shortest path (distance only)
        shortest_path, shortest_cost, _ = self.find_path(grid, start, goal, blocked)

        # Safest path (risk-weighted)
        if risk_map:
            safest_path, safest_dist, safest_risk, _ = self.find_path_with_risk(
                grid, start, goal, risk_map, blocked, safety_weight=0.8
            )
        else:
            safest_path = shortest_path
            safest_dist = shortest_cost
            safest_risk = 0.0

        # Balanced path (50/50)
        if risk_map:
            balanced_path, balanced_dist, balanced_risk, _ = self.find_path_with_risk(
                grid, start, goal, risk_map, blocked, safety_weight=0.5
            )
        else:
            balanced_path = shortest_path
            balanced_dist = shortest_cost
            balanced_risk = 0.0

        return {
            "shortest": {
                "path": shortest_path,
                "distance": round(shortest_cost, 2),
                "risk": 0.0,
                "length": len(shortest_path) - 1 if shortest_path else 0
            },
            "safest": {
                "path": safest_path,
                "distance": round(safest_dist, 2),
                "risk": round(safest_risk, 2),
                "length": len(safest_path) - 1 if safest_path else 0
            },
            "balanced": {
                "path": balanced_path,
                "distance": round(balanced_dist, 2),
                "risk": round(balanced_risk, 2),
                "length": len(balanced_path) - 1 if balanced_path else 0
            }
        }

