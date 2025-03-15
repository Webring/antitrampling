import cv2
import numpy as np
import heapq
import math

class Dijkstra:
    def __init__(self, image_path):
        self.image_path = image_path
        self.img = None
        self.map_matrix = None
        self.start = tuple()
        self.end = tuple()
        self.load_map()

    def __repr__(self):
        return f'Dijkstra({self.image_path})'

    def load_map(self):
        self.img = cv2.imread(self.image_path)
        self.img = cv2.cvtColor(self.img, cv2.COLOR_BGR2RGB)
        self.map_matrix = np.zeros((self.img.shape[0], self.img.shape[1]), dtype=int)

        color_mapping = {
            (0, 255, 0): 0,  # Тротуар
            (255, 165, 0): 1,  # Газон
            (255, 0, 0): 2,  # Дом (непроходимо)
            (0, 0, 0): 3,  # Препятствие (непроходимо)
            (0, 0, 255): 4,  # Старт
            (128, 0, 128): 5  # Финиш
        }

        for color, value in color_mapping.items():
            self.map_matrix[np.all(self.img == color, axis=-1)] = value

        '''
        Если на карте уже есть точки начала и конца, то нужно две нижние строки убрать
        '''
        self.map_matrix[2][2] = 4
        self.map_matrix[-2][-2] = 5

        self.start = tuple(map(int, np.argwhere(self.map_matrix == 4)[0]))
        self.end = tuple(map(int, np.argwhere(self.map_matrix == 5)[0]))


    def astar(self):
        rows, cols = self.map_matrix.shape
        # 8 направлений: вверх, вниз, влево, вправо + диагонали
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1),
                      (-1, -1), (-1, 1), (1, -1), (1, 1)]

        def heuristic(a, b):
            # Евклидово расстояние для диагонального движения
            return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)

        pq = []
        heapq.heappush(pq, (heuristic(self.start, self.end), 0.0, self.start))
        distances = {self.start: 0.0}
        previous = {self.start: None}

        while pq:
            current_f, current_g, current = heapq.heappop(pq)

            if current == self.end:
                break

            if current_g > distances.get(current, float('inf')):
                continue

            for dr, dc in directions:
                nr, nc = current[0] + dr, current[1] + dc

                if 0 <= nr < rows and 0 <= nc < cols and self.map_matrix[nr, nc] in {0, 1, 5}:
                    # Определяем тип шага (прямой/диагональный)
                    is_diagonal = abs(dr) == 1 and abs(dc) == 1
                    step_cost = 1 if self.map_matrix[nr, nc] == 0 else 1.1

                    if is_diagonal:
                        step_cost *= math.sqrt(2)

                    new_g = current_g + step_cost

                    if new_g < distances.get((nr, nc), float('inf')):
                        distances[(nr, nc)] = new_g
                        priority = new_g + heuristic((nr, nc), self.end)
                        heapq.heappush(pq, (priority, new_g, (nr, nc)))
                        previous[(nr, nc)] = current

        path = []
        current = self.end
        while current is not None:
            path.append(current)
            current = previous.get(current)
        path.reverse()

        return path if path and path[0] == self.start else []


    def visualize_path(self,path):
        for r, c in path:
            self.img[r, c] = [255, 0, 255]  # Фиолетовый путь
        resized_img = cv2.resize(self.img, (self.img.shape[1] * 5, self.img.shape[0] * 5))
        cv2.imshow('Shortest Path', cv2.cvtColor(resized_img, cv2.COLOR_RGB2BGR))
        # cv2.resizeWindow('Shortest Path', self.img.shape[0]*5, self.img.shape[1]*5)
        cv2.waitKey(0)
        cv2.destroyAllWindows()



# image_path = 'nstu.png'
# img, matrix, start, end = load_map()
# path = astar(matrix, start, end)
#
# if path:
#     print("Кратчайший путь найден!")
#     visualize_path(img, path)
# else:
#     print("Путь не найден.")


if __name__ == "__main__":
    dijkstra = Dijkstra('nstu.png')
    print(dijkstra)
    path = dijkstra.astar()
    print(path)
    dijkstra.visualize_path(path)

