from PIL import Image
import numpy as np
import heapq
import matplotlib
import random
import multiprocessing as mp
from functools import partial

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
            path.append(start)
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
        self.planned_paths = []

    def update_goal(self, matrix, poi, beta=0.3):
        self.goal = select_goal(self.pos, poi)
        if self.goal:
            new_path = a_star_poi(matrix, self.pos, self.goal, poi,
                                  beta=beta,
                                  randomness=self.risk_factor,
                                  curiosity=self.curiosity)
            if new_path:
                simplified_path = simplify_path(matrix, new_path)
                converted_path = [(p[1], p[0]) for p in simplified_path]
                self.planned_paths.append(converted_path)
                self.path = new_path.copy()

    def move(self, matrix):
        if self.path and not self.reached:
            for _ in range(min(3, len(self.path))):
                next_pos = self.path.pop(0)
                self.pos = next_pos
                self.trail.append(self.pos)
                if self.pos == self.goal:
                    self.reached = True
                    break

def parallel_update_goal(ped_data, matrix, poi, beta):
    ped = Pedestrian(**ped_data)
    ped.update_goal(matrix, poi, beta)
    return ped

def simulate_pedestrians(matrix, poi, num_pedestrians=50, start_positions=None):
    if start_positions is None:
        start_positions = [(117, 190)]

    pedestrians = [
        Pedestrian(
            start_pos=start_positions[np.random.choice(len(start_positions))],
            risk_factor=np.random.uniform(0.1, 0.5),
            curiosity=np.random.uniform(0.05, 0.2)
        ) for _ in range(num_pedestrians)
    ]

    ped_data_list = [
        {'start_pos': ped.pos, 'risk_factor': ped.risk_factor, 'curiosity': ped.curiosity}
        for ped in pedestrians
    ]

    with mp.Pool() as pool:
        updated_peds = pool.starmap(
            partial(parallel_update_goal, matrix=matrix, poi=poi, beta=0.3),
            [(data,) for data in ped_data_list]
        )

    for old_ped, new_ped in zip(pedestrians, updated_peds):
        old_ped.goal = new_ped.goal
        old_ped.path = new_ped.path
        old_ped.planned_paths = new_ped.planned_paths

    return pedestrians


def step_simulation(pedestrians, poi, matrix):
    need_update = []
    for ped in pedestrians:
        if ped.reached or not ped.goal:
            need_update.append(ped)

    if not need_update:
        return

    args_list = []
    for ped in need_update:
        goal = select_goal(ped.pos, poi)
        if goal:
            args = (matrix, ped.pos, goal, poi, 0.3, ped.risk_factor, ped.curiosity)
            args_list.append(args)

    with mp.Pool() as pool:
        paths = pool.starmap(a_star_poi, args_list)

    for i, path in enumerate(paths):
        ped = need_update[i]
        if path:
            simplified = simplify_path(matrix, path)
            converted_path = [(p[1], p[0]) for p in simplified]
            ped.planned_paths.append(converted_path)
            ped.path = path.copy()
            ped.goal = args_list[i][2]

    for ped in pedestrians:
        ped.move(matrix)


def visualize(matrix, poi, pedestrians, frames=1000, interval=30):
    custom_cmap = mcolors.ListedColormap(["red", "white", "green"])

    fig, ax = plt.subplots()
    im = ax.imshow(matrix, cmap=custom_cmap)

    poi_x = [p[1] for p in poi]
    poi_y = [p[0] for p in poi]
    ax.scatter(poi_x, poi_y, c='purple', s=100, alpha=0.5, label='POI')
    ped_scatter = ax.scatter([], [], c='red', s=50, marker='o', label='Pedestrians')
    trail_lines = [ax.plot([], [], c='blue', alpha=0.3, linewidth=2)[0] for _ in pedestrians]

    def update(frame):
        step_simulation(pedestrians, poi, matrix)
        ped_x = [ped.pos[1] for ped in pedestrians]
        ped_y = [ped.pos[0] for ped in pedestrians]
        ped_scatter.set_offsets(np.c_[ped_x, ped_y])
        for i, ped in enumerate(pedestrians):
            if len(ped.trail) > 1:
                x_coords = [p[1] for p in ped.trail]
                y_coords = [p[0] for p in ped.trail]
                trail_lines[i].set_data(x_coords, y_coords)
        return [ped_scatter] + trail_lines

    ani = FuncAnimation(fig, update, frames=frames, interval=interval, blit=True)
    plt.show()


def get_paths(matrix, poi, pedestrians, simulation_steps=1000):
    for _ in range(simulation_steps):
        step_simulation(pedestrians, poi, matrix)
    return [ped.planned_paths[0] for ped in pedestrians]

def line_of_sight(matrix, start, end):
    (y0, x0) = start
    (y1, x1) = end
    dx = abs(x1 - x0)
    dy = abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx - dy

    current_x = x0
    current_y = y0

    while True:
        if current_y < 0 or current_y >= matrix.shape[0] or current_x < 0 or current_x >= matrix.shape[1]:
            return False
        if matrix[current_y][current_x] == 0:
            return False
        if current_x == x1 and current_y == y1:
            break
        e2 = 2 * err
        if e2 > -dy:
            err -= dy
            current_x += sx
        if e2 < dx:
            err += dx
            current_y += sy

    return True


def simplify_path(matrix, path):
    if len(path) < 2:
        return path.copy()
    simplified = [path[0]]
    current_index = 0
    while current_index < len(path) - 1:
        next_index = len(path) - 1
        while next_index > current_index + 1:
            start_node = path[current_index]
            end_node = path[next_index]
            if line_of_sight(matrix, start_node, end_node):
                simplified.append(end_node)
                current_index = next_index
                break
            next_index -= 1
        else:
            simplified.append(path[current_index + 1])
            current_index += 1
    return simplified

def simulate(data, trajectory):
    def bresenham_line(x0, y0, x1, y1):
        """Алгоритм Брезенхема для построения линии между двумя точками."""
        points = []
        dx = abs(x1 - x0)
        dy = abs(y1 - y0)
        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        err = dx - dy

        while True:
            points.append((x0, y0))
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 > -dy:
                err -= dy
                x0 += sx
            if e2 < dx:
                err += dx
                y0 += sy

        return points

    def point_in_polygon(x, y, polygon):
        """Проверяет, находится ли точка (x, y) внутри полигона."""
        n = len(polygon)
        inside = False
        for i in range(n):
            p1 = polygon[i]
            p2 = polygon[(i + 1) % n]
            p1x, p1y = p1
            p2x, p2y = p2

            # Пересекает ли луч y=const ребро между p1 и p2
            if ((p1y > y) != (p2y > y)):
                xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                if x <= xinters:
                    inside = not inside
        return inside

    def fill_polygon(matrix, polygon, fill_value):
        """Заполняет внутреннюю область полигона."""
        if not polygon:
            return

        min_x = max(min(p[0] for p in polygon), 0)
        max_x = min(max(p[0] for p in polygon), matrix.shape[1] - 1)
        min_y = max(min(p[1] for p in polygon), 0)
        max_y = min(max(p[1] for p in polygon), matrix.shape[0] - 1)

        for y in range(min_y, max_y + 1):
            for x in range(min_x, max_x + 1):
                if point_in_polygon(x, y, polygon):
                    matrix[y, x] = fill_value

    def generate_matrix(data):
        """Генерирует матрицу и находит стартовую точку."""
        height, width = 1080, 1920
        matrix = np.ones((height, width), dtype=int) * 1  # Изначально все клетки проходимы

        for fig_id, fig_data in data.items():
            type_value = 2 if fig_data['type'] == 'Трава' else 0
            points = fig_data['points']

            if len(points) < 3:
                raise ValueError("Для полигона нужно минимум 3 точки")

            # Рисуем границы полигона
            polygon = points + [points[0]]  # Замыкаем контур
            for i in range(len(polygon) - 1):
                x0, y0 = polygon[i]
                x1, y1 = polygon[i + 1]
                for x, y in bresenham_line(x0, y0, x1, y1):
                    if 0 <= x < width and 0 <= y < height:
                        matrix[y, x] = type_value

            # Заполняем внутреннюю область
            fill_polygon(matrix, points, type_value)

        # Поиск стартовой точки
        while True:
            start_x = random.randint(0, width - 1)
            start_y = random.randint(0, height - 1)
            if matrix[start_y, start_x] in (1, 2):
                return matrix, (start_y, start_x)


    matrix, _ = generate_matrix(data)

    start = [tuple(trajectory[0][::-1])]
    print(matrix[start[0][0], start[0][1]])
    poi = {}
    for point in trajectory[1:]:
        final = tuple(point[::-1])
        poi[final] = np.random.uniform(0.5, 1.5)
    print(poi)
    print(start)
    peds = simulate_pedestrians(matrix, poi, 20, start)
    # visualize(matrix, poi, peds, frames=1000)
    all_paths = get_paths(matrix, poi, peds)
    return all_paths


if __name__ == '__main__':
    # data = {'0': {'type': 'Трава', 'points': [[783, 98], [520, 312], [1077, 435], [1053, 167]]},
    #         '1': {'type': 'Здание', 'points': [[267, 352], [582, 365], [577, 443], [180, 442], [190, 383]]}}
    # trajectory = [[1108, 203], [158, 168]]
    data = {'0': {'type': 'Здание', 'points': [[759, 226], [779, 316], [708, 447], [593, 468], [552, 508], [521, 529], [501, 554], [439, 646], [413, 766], [414, 867], [510, 862], [645, 832], [788, 835], [884, 861], [895, 788], [984, 643], [1020, 578], [1025, 546], [1018, 409], [984, 314], [986, 245], [973, 214], [958, 216], [932, 250], [901, 277], [854, 280], [812, 250]]}}

    trajectory =  [[331, 242], [589, 136]]
    print(simulate(data, trajectory))
