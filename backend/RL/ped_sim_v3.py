import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import json
import cv2
import os
import matplotlib.pyplot as plt


# ======= 1. Обработка карты и json =======

def load_trajectory(json_data):
    # Преобразуем в список кортежей с int-координатами
    return [tuple(map(int, point)) for point in json_data.get("trajectory", [])]


def draw_polygon_on_map(map_matrix, points, value):
    # Гарантируем int-координаты и в пределах карты
    polygon = np.array([np.clip(np.round(points), 0, np.array(map_matrix.shape[::-1]) - 1)], dtype=np.int32)
    cv2.fillPoly(map_matrix, polygon, value)


def build_map(json_data, map_size):
    h, w = map_size
    map_matrix = np.zeros((h, w), dtype=np.int8)  # int8 — чтобы вмещать -1

    # Временная маска только для зданий
    building_mask = np.zeros((h, w), dtype=np.uint8)

    for poly in json_data["polygons"]:
        points = poly["points"]
        try:
            poly_type = poly["type"].lower()
        except:
            poly_type = poly["type"]

        if poly_type in ["building", "здание", 2]:
            draw_polygon_on_map(building_mask, points, value=1)
        elif poly_type in ["grass", "трава", 1]:
            draw_polygon_on_map(map_matrix, points, value=2)
        elif poly_type in ["fence", "забор", 3]:
            draw_polygon_on_map(map_matrix, points, value=3)

    # Здания → основная карта
    map_matrix[building_mask == 1] = 1

    # Расширение зданий на 1 пиксель во все стороны
    kernel = np.ones((3, 3), dtype=np.uint8)
    dilated = cv2.dilate(building_mask, kernel, iterations=1)

    # Вокруг зданий (там, где пусто было раньше) → -1
    map_matrix[(dilated == 1) & (map_matrix == 0)] = -1

    return map_matrix


def visualize_map(map_matrix):
    # Значения: цвет (в RGB)
    value_to_color = {
        0: (1.0, 1.0, 1.0),  # пусто — белый
        1: (0.5, 0.5, 0.5),  # здание — серый
        2: (0.3, 0.8, 0.3),  # трава — зелёный
        -1: (1.0, 0.0, 0.0),  # окружение зданий — розовый
        3: (0.0, 0.0, 1.0),
    }

    h, w = map_matrix.shape
    img = np.zeros((h, w, 3), dtype=np.float32)

    for value, color in value_to_color.items():
        mask = map_matrix == value
        for i in range(3):
            img[:, :, i][mask] = color[i]

    plt.figure(figsize=(10, 10))
    plt.imshow(img)
    plt.title("Карта с расширенными зданиями")
    plt.axis('off')
    plt.show()


import numpy as np
import networkx as nx
from multiprocessing import Pool, cpu_count

def process_section(i, map_matrix, weights):
    G_local = nx.Graph()
    h, w = map_matrix.shape

    # Все 8 направлений с коэффициентами расстояния
    directions = [
        (-1, -1, np.sqrt(2)),  # Вверх-влево
        (-1, 0, 1.0),  # Вверх
        (-1, 1, np.sqrt(2)),  # Вверх-вправо
        (0, -1, 1.0),  # Влево
        (0, 1, 1.0),  # Вправо
        (1, -1, np.sqrt(2)),  # Вниз-влево
        (1, 0, 1.0),  # Вниз
        (1, 1, np.sqrt(2)),  # Вниз-вправо
    ]

    for j in range(w):
        if map_matrix[i, j] != 1:  # Исключаем здания
            G_local.add_node((i, j))  # Явное создание узла

        current_type = map_matrix[i, j]

        for dx, dy, dist in directions:
            ni, nj = i + dx, j + dy

            # Проверка границ
            if ni < 0 or ni >= h or nj < 0 or nj >= w:
                continue

            if map_matrix[ni, nj] == 1:  # Сосед - здание
                continue

            neighbor_type = map_matrix[ni, nj]

            # Вычисляем весовой коэффициент
            if current_type == 3 or neighbor_type == 3:
                # Если хотя бы одна из клеток - забор
                base_weight = weights['fence']
            elif current_type == 2 and neighbor_type == 2:
                # Обе клетки - трава
                base_weight = weights['grass']
            else:
                # Любой другой случай (дорога или смешанные типы)
                try:
                    base_weight = weights['road']
                except:
                    base_weight = 1.0

            # Модификаторы для разных типов поверхности
            if current_type != neighbor_type:
                base_weight *= 1.25

            # Учитываем расстояние
            final_weight = base_weight * dist

            # Добавляем ребро только в одном направлении
            if ni > i or (ni == i and nj > j):
                G_local.add_edge(
                    (i, j),
                    (ni, nj),
                    weight=final_weight
                )

    return G_local


# Основная функция построения графа с использованием многозадачности
def build_graph(map_matrix , weights=None):
    if weights is None:
        weights = {
            "grass": 1.5,
            "road": 1.0,
            "fence": 10.0,
        }

    # Получаем количество доступных ядер
    num_workers = cpu_count()

    # Создаём пул процессов
    with Pool(num_workers) as pool:
        # Результаты обработки строк карты в разных процессах
        results = pool.starmap(process_section, [(i, map_matrix, weights) for i in range(map_matrix.shape[0])])

    # Объединяем все локальные графы
    G = nx.Graph()
    for result in results:
        G.add_edges_from(result.edges(data=True))

    return G


# Визуализация графа
def visualize_graph(graph):
    if len(graph.nodes) > 1000:
        print("Граф слишком большой для визуализации. Отображение первых 1000 узлов.")
        nodes = list(graph.nodes())[:1000]
        subgraph = graph.subgraph(nodes)
    else:
        subgraph = graph

    plt.figure(figsize=(15, 15))
    pos = {node: (node[1], node[0]) for node in subgraph.nodes()}
    nx.draw(subgraph, pos, node_size=10, node_color='lightblue', with_labels=False)
    plt.show()


def heuristic(a, b):
    # Эвристика: евклидово расстояние
    return np.linalg.norm(np.array(a) - np.array(b))


def find_path(graph, start, goal):
    try:
        path = nx.astar_path(graph, start, goal, heuristic=heuristic, weight='weight')
        path = [list(reversed(i)) for i in path]
        return path
    except nx.NetworkXNoPath:
        print(f"Нет пути между {start} и {goal}")
        return []


def simplify_path(path, epsilon=2.0):
    """
    Упрощает путь с помощью алгоритма Ramer-Douglas-Peucker.
    :param path: список точек [(x1, y1), (x2, y2), ...]
    :param epsilon: максимальное расстояние для упрощения
    :return: упрощенный путь
    """
    if len(path) < 3:
        return [tuple(p) for p in path]

    points = np.array(path, dtype=np.float32)
    keep = np.zeros(len(points), dtype=bool)
    keep[0] = True
    keep[-1] = True
    stack = [(0, len(points) - 1)]

    while stack:
        start, end = stack.pop()
        if end - start < 2:
            continue

        max_dist = 0.0
        max_idx = start

        # Вектор направления отрезка
        a = points[start]
        b = points[end]
        line_dir = b - a

        for i in range(start + 1, end):
            if np.allclose(line_dir, 0):
                # Отрезок вырожден в точку
                dist = np.linalg.norm(points[i] - a)
            else:
                # Вычисляем проекцию точки на отрезок
                t = np.dot(points[i] - a, line_dir) / np.dot(line_dir, line_dir)
                t = np.clip(t, 0.0, 1.0)
                projection = a + t * line_dir
                dist = np.linalg.norm(points[i] - projection)

            if dist > max_dist:
                max_dist = dist
                max_idx = i

        if max_dist > epsilon:
            keep[max_idx] = True
            stack.append((start, max_idx))
            stack.append((max_idx, end))

    simplified = points[keep].tolist()
    return [list(map(int, p)) for p in simplified]


# def smooth_path(path, map_matrix, max_deviation=10, obstacle_force=0.8, smoothness=0.6, iterations=100):
#     """
#     Улучшенное сглаживание с физическим моделированием и учетом препятствий.
#     :param path: исходный путь [[x1,y1], [x2,y2], ...]
#     :param map_matrix: матрица карты с препятствиями
#     :param max_deviation: максимальное отклонение от исходного пути (пиксели)
#     :param obstacle_force: сила отталкивания от препятствий
#     :param smoothness: коэффициент сглаживания (0.0-1.0)
#     :param iterations: количество итераций оптимизации
#     """
#     if len(path) < 3:
#         return path
#
#     path = np.array(path, dtype=np.float32)
#     original_path = path.copy()
#     h, w = map_matrix.shape
#
#     # Инициализация сил
#     velocity = np.zeros_like(path)
#
#     for _ in range(iterations):
#         # 1. Рассчитываем силы сглаживания
#         smooth_force = np.zeros_like(path)
#         for i in range(1, len(path) - 1):
#             smooth_force[i] = (path[i - 1] + path[i + 1] - 2 * path[i]) * smoothness
#
#         # 2. Рассчитываем силы притяжения к исходному пути
#         attraction_force = (original_path - path) * 0.2
#
#         # 3. Рассчитываем силы отталкивания от препятствий
#         obstacle_force_matrix = np.zeros_like(path)
#         for i in range(len(path)):
#             x, y = int(path[i][0]), int(path[i][1])
#             if 0 <= x < w and 0 <= y < h and map_matrix[y, x] == 1:
#                 # Ищем ближайшую свободную точку
#                 for r in range(1, 6):
#                     found = False
#                     for dx in [-r, 0, r]:
#                         for dy in [-r, 0, r]:
#                             nx, ny = x + dx, y + dy
#                             if 0 <= nx < w and 0 <= ny < h:
#                                 if map_matrix[ny, nx] != 1:
#                                     obstacle_force_matrix[i] += (np.array([nx, ny]) - path[i]) * obstacle_force
#                                     found = True
#                                     break
#                         if found: break
#                     if found: break
#
#         # 4. Обновляем скорость и позиции
#         velocity += smooth_force + attraction_force + obstacle_force_matrix
#         velocity *= 0.9  # Затухание скорости
#         path += velocity
#
#         # 5. Ограничиваем отклонение от исходного пути
#         for i in range(len(path)):
#             deviation = np.linalg.norm(path[i] - original_path[i])
#             if deviation > max_deviation:
#                 path[i] = original_path[i] + (path[i] - original_path[i]) * (max_deviation / deviation)
#
#     # 6. Фильтрация слишком близких точек
#     filtered = [path[0].tolist()]
#     for p in path[1:]:
#         if np.linalg.norm(p - filtered[-1]) > 2.0:
#             filtered.append(p.tolist())
#
#     return [[int(x), int(y)] for x, y in filtered]


import numpy as np
from scipy.ndimage import distance_transform_edt


def smooth_path(path, map_matrix, max_deviation=10, obstacle_force=2.0, smoothness=0.6, iterations=100):
    if len(path) < 3:
        return path

    path = np.array(path, dtype=np.float32)
    original_path = path.copy()
    h, w = map_matrix.shape

    # Интерполяция для увеличения плотности точек
    def interpolate(points, factor=5):
        interp = [points[0]]
        for i in range(1, len(points)):
            seg = np.linspace(points[i - 1], points[i], factor, endpoint=False)[1:]
            interp.extend(seg)
        interp.append(points[-1])
        return np.array(interp, dtype=np.float32)

    path = interpolate(path, factor=6)
    original_path = path.copy()

    # Маска расстояний до ближайшего свободного пикселя (0 внутри здания, >0 вне)
    obstacle_mask = (map_matrix == 1)
    dist_map = distance_transform_edt(~obstacle_mask)
    grad_y, grad_x = np.gradient(dist_map)  # градиенты по x и y

    velocity = np.zeros_like(path)

    for _ in range(iterations):
        smooth_force = np.zeros_like(path)
        for i in range(1, len(path) - 1):
            smooth_force[i] = (path[i - 1] + path[i + 1] - 2 * path[i]) * smoothness

        attraction_force = (original_path - path) * 0.25
        obstacle_force_matrix = np.zeros_like(path)

        for i in range(len(path)):
            x, y = int(path[i][0]), int(path[i][1])
            if 0 <= x < w and 0 <= y < h:
                # Если в здании — отталкиваем по градиенту расстояний
                if obstacle_mask[y, x]:
                    gx = grad_x[y, x]
                    gy = grad_y[y, x]
                    grad = np.array([gx, gy])
                    norm = np.linalg.norm(grad)
                    if norm != 0:
                        obstacle_force_matrix[i] += (grad / norm) * obstacle_force

        velocity += smooth_force + attraction_force + obstacle_force_matrix
        velocity *= 0.85
        path += velocity

        # Ограничение отклонения и проверка на заход в здания
        for i in range(len(path)):
            deviation = np.linalg.norm(path[i] - original_path[i])
            if deviation > max_deviation:
                path[i] = original_path[i] + (path[i] - original_path[i]) * (max_deviation / deviation)

            # Жёсткая проверка: если внутри здания — ОТКАТ
            x, y = int(path[i][0]), int(path[i][1])
            if 0 <= x < w and 0 <= y < h and obstacle_mask[y, x]:
                path[i] = original_path[i]  # принудительный откат

    # Фильтрация лишних точек
    filtered = [path[0]]
    for i in range(1, len(path)):
        if np.linalg.norm(path[i] - filtered[-1]) >= 2.0:
            filtered.append(path[i])

    return [[int(x), int(y)] for x, y in filtered]


def start(width, height, data, points,weights=None):
    map_size = (height, width)
    map_matrix = build_map(data, map_size=map_size)
    if weights is None:
        graph = build_graph(map_matrix)
    else:
        graph = build_graph(map_matrix, weights)
    print(graph)
    import random
    from itertools import combinations

    LEVEL_PROBABILITY = {
        1: 0.95,
        2: 0.80,
        3: 0.70,
        4: 0.60,
        5: 0.50,
        6: 0.40,
        7: 0.30,
        8: 0.20,
        9: 0.10,
        10: 0.05,
    }

    def level_probability(level):
        return LEVEL_PROBABILITY.get(level, 0.01)  # на всякий случай для неизвестного уровня

    # def generate_random_point_combinations(points_, max_fraction=0.5):
    #     #     """
    #     #     Генерирует случайное количество случайных сочетаний (пар) из массива точек.
    #     #
    #     #     :param points: список точек вида [[x1, y1], [x2, y2], ...]
    #     #     :param max_fraction: максимальная доля всех возможных сочетаний, от 0 до 1
    #     #     :return: список случайных сочетаний (пар)
    #     #     """
    #     #     if len(points_) < 2:
    #     #         return []
    #     #
    #     #     all_combinations = list(combinations(points_, 2))
    #     #     max_combos = int(len(all_combinations) * max_fraction)
    #     #     num_to_select = random.randint(1, max(1, max_combos))
    #     #
    #     #     return random.sample(all_combinations, num_to_select)

    def filter_points_by_level_probability(points):
        """Фильтрует точки с учётом вероятности по level."""
        filtered = []
        for pt in points:
            prob = level_probability(pt["level"])
            if random.random() < prob:
                filtered.append(pt)
        return filtered

    def point_to_xy(point):
        return [point["x"], point["y"]]

    def generate_random_point_combinations(points, max_fraction=0.5):
        """
        Генерирует случайные пары точек, учитывая вероятность на основе их уровня.
        """
        filtered_points = filter_points_by_level_probability(points)

        if len(filtered_points) < 2:
            return []

        all_combinations = list(combinations(filtered_points, 2))
        max_combos = int(len(all_combinations) * max_fraction)
        num_to_select = random.randint(1, max(1, max_combos))

        selected_combinations = random.sample(all_combinations, num_to_select)

        # Возвращаем пары как [[x1, y1], [x2, y2]]
        return [[point_to_xy(p1), point_to_xy(p2)] for p1, p2 in selected_combinations]

    combs = generate_random_point_combinations(points)
    paths = []
    # print(combs)
    # print("tt")
    import traceback
    try:
        for comb in combs:
            # print("Start node exists:", tuple(comb[0][::-1]) in graph.nodes)
            # print("Goal node exists:", tuple(comb[1][::-1]) in graph.nodes)
            path = find_path(graph, tuple(comb[0][::-1]), tuple(comb[1][::-1]))
            # print(path)
            path = simplify_path(path)
            # print(path)
            smooth_paths = smooth_path(path, map_matrix)
            # print(smooth_paths)
            paths.append(smooth_paths)
    except Exception as e:
        traceback.print_exc()
    return paths


if __name__ == "__main__":
    patch_size = 11
    map_size = (1080, 1920)

    import networkx as nx

    with open('/Users/mac/Desktop/NSTU/6 term/WEB/project/CNN_MLP/map_52.json', 'r') as f:
        data = json.load(f)
        trajectory = load_trajectory(data)
    map_matrix = build_map(data, map_size=map_size)
    # visualize_map(map_matrix)

    start(None, None, data)
    # graph = build_graph(map_matrix)
    # print(graph)
    # # edge_labels = nx.get_edge_attributes(graph, 'weight')
    # # print(edge_labels)
    # start_node = (121, 325)
    # goal_node = (842, 1910)
    #
    # print("Start node exists:", start_node in graph.nodes)
    # print("Goal node exists:", goal_node in graph.nodes)
    # path = find_path(graph, start_node,goal_node)
    # print(path)
    # path = simplify_path(path)
    # print(path)
    # smooth_path = smooth_path(path, map_matrix)
    # print(smooth_path)

    # print("Отрисовка...")
    # visualize_graph(graph)
