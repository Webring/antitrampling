from PIL import Image
import numpy as np
import heapq
import matplotlib
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import matplotlib.colors as mcolors

def load_map(image_path):
    img = Image.open(image_path).convert("RGB")
    width, height = img.size
    map_matrix = np.zeros((height, width), dtype=int)
    for y in range(height):
        for x in range(width):
            r, g, b = img.getpixel((x, y))
            if r > 200 and g < 50 and b < 50:
                map_matrix[y][x] = 0  # Препятствие
            elif g > 200 and r < 100:
                map_matrix[y][x] = 1  # Проходимая зона
            elif r > 200 and g > 100 and b < 50:
                map_matrix[y][x] = 2  # Условно проходимая
            else:
                map_matrix[y][x] = 0
    return map_matrix

def get_neighbors(matrix, node):
    y, x = node
    neighbors = []
    height, width = matrix.shape
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1),
                  (-1, -1), (-1, 1), (1, -1), (1, 1)]
    for dy, dx in directions:
        ny, nx = y + dy, x + dx
        if 0 <= ny < height and 0 <= nx < width and matrix[ny][nx] != 0:
            neighbors.append((ny, nx))
    return neighbors

def cost(matrix, from_node, to_node, randomness=0.2):
    terrain_cost = {1: 1.0, 2: 1.5}
    y, x = to_node
    base_cost = terrain_cost.get(matrix[y][x], float('inf'))
    return base_cost * (1 + np.random.uniform(-randomness, randomness))

def a_star_poi(matrix, start, end, poi_weights, beta=0.1, randomness=0.2, curiosity=0.1):
    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}
    g_score = {start: 0}
    while open_set:
        current = heapq.heappop(open_set)[1]
        if current == end:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            return path[::-1]
        for neighbor in get_neighbors(matrix, current):
            tentative_g = g_score[current] + cost(matrix, current, neighbor, randomness)
            if neighbor in poi_weights:
                tentative_g -= beta * poi_weights[neighbor]
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                heuristic = abs(neighbor[0] - end[0]) + abs(neighbor[1] - end[1])
                heuristic *= np.random.uniform(1 - curiosity, 1 + curiosity)
                f_score = tentative_g + heuristic
                heapq.heappush(open_set, (f_score, neighbor))
    return None

def generate_poi(matrix, num_poi=5):
    poi = {}
    height, width = matrix.shape
    for _ in range(num_poi):
        while True:
            y, x = np.random.randint(0, height), np.random.randint(0, width)
            if matrix[y][x] == 1:
                poi[(y, x)] = np.random.uniform(0.5, 1.5)
                break
    return poi

def select_goal(start, poi):
    if not poi:
        return None
    points = list(poi.keys())
    distances = [abs(start[0] - p[0]) + abs(start[1] - p[1]) for p in points]
    scores = [poi[p] / (d + 1e-5) for p, d in zip(points, distances)]
    exp_scores = np.exp(scores)
    probabilities = exp_scores / exp_scores.sum()
    selected_idx = np.random.choice(len(points), p=probabilities)
    return points[selected_idx]

class Pedestrian:
    def __init__(self, start_pos, risk_factor=0.3, curiosity=0.1):
        self.pos = start_pos
        self.risk_factor = risk_factor
        self.curiosity = curiosity
        self.goal = None
        self.path = []
        self.reached = False
        self.trail = [start_pos]
    def update_goal(self, poi, matrix):
        if not self.reached:
            self.goal = select_goal(self.pos, poi)
            if self.goal:
                self.path = a_star_poi(matrix, self.pos, self.goal, poi, beta=0.3, randomness=self.risk_factor, curiosity=self.curiosity)
    def move(self, matrix):
        if self.path and not self.reached:
            next_pos = self.path.pop(0)
            self.pos = next_pos
            self.trail.append(self.pos)
            if self.pos == self.goal:
                self.reached = True

def simulate_pedestrians(matrix, poi, num_pedestrians=50):
    start_positions = [(117,190)]
    if not start_positions:
        raise ValueError("Нет доступных стартовых позиций!")
    pedestrians = [
        Pedestrian(
            start_pos=start_positions[np.random.choice(len(start_positions))],
            risk_factor=np.random.uniform(0.1, 0.5),
            curiosity=np.random.uniform(0.05, 0.2)
        ) for _ in range(num_pedestrians)
    ]
    for ped in pedestrians:
        ped.update_goal(poi, matrix)
    return pedestrians

if __name__ == '__main__':
    matrix = load_map("nstu.png")
    poi = generate_poi(matrix, num_poi=3)
    pedestrians = simulate_pedestrians(matrix, poi, 100)
    custom_cmap = mcolors.ListedColormap(["red", "white", "green"])  # 0 - красный, 1 - белый, 2 - зелёный

    fig, ax = plt.subplots()
    im = ax.imshow(matrix, cmap=custom_cmap)  # Применяем кастомную палитру

    poi_x = [p[1] for p in poi]
    poi_y = [p[0] for p in poi]
    ax.scatter(poi_x, poi_y, c='purple', s=100, alpha=0.5, label='POI')
    ped_scatter = ax.scatter([], [], c='red', s=50, marker='o', label='Pedestrians')
    trail_lines = [ax.plot([], [], c='blue', alpha=0.3, linewidth=2)[0] for _ in pedestrians]
    def update(frame):
        for ped in pedestrians:
            if ped.reached or not ped.goal:
                ped.update_goal(poi, matrix)
            ped.move(matrix)
        ped_x = [ped.pos[1] for ped in pedestrians]
        ped_y = [ped.pos[0] for ped in pedestrians]
        ped_scatter.set_offsets(np.c_[ped_x, ped_y])
        for i, ped in enumerate(pedestrians):
            if len(ped.trail) > 1:
                x_coords = [p[1] for p in ped.trail]
                y_coords = [p[0] for p in ped.trail]
                trail_lines[i].set_data(x_coords, y_coords)
        return [ped_scatter] + trail_lines
    ani = FuncAnimation(fig, update, frames=1000, interval=50, blit=True)
    plt.show()
