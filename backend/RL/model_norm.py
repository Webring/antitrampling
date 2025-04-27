import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import json
import cv2
import os

# ======= 1. Обработка карты и json =======

def draw_polygon_on_map(map_matrix, points, value):
    polygon = np.array([points], dtype=np.int32)
    cv2.fillPoly(map_matrix, polygon, value)

def build_map(json_data, map_size):
    h, w = map_size
    map_matrix = np.zeros((h, w), dtype=np.uint8)

    for poly in json_data["polygons"]:
        points = poly["points"]
        poly_type = poly["type"].lower()

        if poly_type in ["building", "Здание"]:
            draw_polygon_on_map(map_matrix, points, value=1)
        elif poly_type in ["grass", "Трава"]:
            draw_polygon_on_map(map_matrix, points, value=2)

    return map_matrix

def extract_patch(map_matrix, center, size=11):
    half = size // 2
    x, y = int(center[0]), int(center[1])

    x1 = max(x - half, 0)
    y1 = max(y - half, 0)
    x2 = min(x + half + 1, map_matrix.shape[1])
    y2 = min(y + half + 1, map_matrix.shape[0])

    patch = map_matrix[y1:y2, x1:x2]

    pad_y = size - patch.shape[0]
    pad_x = size - patch.shape[1]

    patch = np.pad(patch, ((0, pad_y), (0, pad_x)), mode='constant', constant_values=0)
    return patch

def json_to_dataset(json_path, map_size=(1080, 1920), patch_size=11):
    with open(json_path, 'r') as f:
        data = json.load(f)

    map_matrix = build_map(data, map_size)
    dataset = []
    trajectory = data["trajectory"]

    if len(trajectory) < 2:
        return []

    goal = trajectory[-1]

    for i in range(len(trajectory) - 1):
        current = trajectory[i]
        next_step = trajectory[i + 1]

        patch = extract_patch(map_matrix, current, size=patch_size).astype(np.float32)
        delta = [next_step[0] - current[0], next_step[1] - current[1]]
        goal_offset = [goal[0] - current[0], goal[1] - current[1]]

        dataset.append((patch, goal_offset, delta))

    return dataset

# def json_to_dataset(json_path, map_size=(1080, 1920), patch_size=11):
#     with open(json_path, 'r') as f:
#         data = json.load(f)
#
#     map_matrix = build_map(data, map_size)
#     dataset = []
#     trajectory = data["trajectory"]
#
#     if len(trajectory) < 2:
#         return []
#
#     goal = trajectory[-1]
#     map_height, map_width = map_size
#
#     for i in range(len(trajectory) - 1):
#         current = trajectory[i]
#         next_step = trajectory[i + 1]
#
#         patch = extract_patch(map_matrix, current, size=patch_size).astype(np.float32)
#         delta = [next_step[0] - current[0], next_step[1] - current[1]]
#         goal_offset = [goal[0] - current[0], goal[1] - current[1]]
#
#         dataset.append((patch, goal_offset, delta))
#
#         # Генерация негативных примеров для соседних зданий
#         for dx in [-1, 0, 1]:
#             for dy in [-1, 0, 1]:
#                 if dx == 0 and dy == 0:
#                     continue
#                 x = current[0] + dx
#                 y = current[1] + dy
#                 if 0 <= x < map_width and 0 <= y < map_height:
#                     if map_matrix[y, x] == 1:
#                         corrected_delta = [-dx, -dy]
#                         dataset.append((patch.copy(), goal_offset.copy(), corrected_delta))
#
#     return dataset

def load_all_datasets(folder_path, map_size=(512, 512), patch_size=11):
    all_data = []

    for filename in os.listdir(folder_path):
        if filename.endswith(".json"):
            full_path = os.path.join(folder_path, filename)
            dataset = json_to_dataset(full_path, map_size=map_size, patch_size=patch_size)
            all_data.extend(dataset)

    return all_data

# ======= 2. Модель =======

class StepPredictorBig(nn.Module):
    def __init__(self):
        super().__init__()
        self.cnn = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((4, 4))
        )
        self.mlp = nn.Sequential(
            nn.Linear(256 * 4 * 4 + 2, 512),
            nn.ReLU(),
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Linear(128, 2)
        )

    def forward(self, patch, goal_offset):
        x = self.cnn(patch)
        x = x.view(x.size(0), -1)
        x = torch.cat([x, goal_offset], dim=1)
        return self.mlp(x)

# ======= 3. Обучение, сохранение, загрузка =======

def train_model(model, dataset, map_size, epochs=10, batch_size=16, lr=1e-3, map_matrix = None):
    optimizer = optim.Adam(model.parameters(), lr=lr)
    criterion = nn.MSELoss()
    map_width, map_height = map_size[1], map_size[0]
    scale = torch.tensor([map_width, map_height], dtype=torch.float32)

    penalty_coef = 10
    for epoch in range(epochs):
        np.random.shuffle(dataset)
        epoch_loss = 0
        batches = 0

        for i in range(0, len(dataset), batch_size):
            batch = dataset[i:i+batch_size]
            if len(batch) < batch_size:
                continue

            patches = torch.tensor(np.array([b[0] for b in batch]), dtype=torch.float32).unsqueeze(1) / 2.0
            goals = torch.tensor(np.array([b[1] for b in batch]), dtype=torch.float32)
            deltas = torch.tensor(np.array([b[2] for b in batch]), dtype=torch.float32)

            goals_normalized = goals / scale
            deltas_normalized = deltas / scale

            preds = model(patches, goals_normalized)
            loss = criterion(preds, deltas_normalized)

            # === ДОБАВЛЕНИЕ ШТРАФА ЗА ШАГ В ЗДАНИЕ ===
            with torch.no_grad():
                penalties = 0
                center = patches[:, 0, 5, 5]  # batch_size штук
                building_mask = (center == 0.5)  # тк делили на 2.0 раньше
                penalties = building_mask.sum().item() * penalty_coef

            penalties_tensor = torch.tensor(penalties, dtype=torch.float32) / batch_size
            loss += penalties_tensor

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item()
            batches += 1

        if batches > 0:
            print(f"Epoch {epoch+1}/{epochs} | Avg Loss: {epoch_loss / batches:.9f}")
        else:
            print(f"Epoch {epoch+1}/{epochs} | Нет валидных батчей.")

def save_model(model, path="step_model.pth"):
    torch.save(model.state_dict(), path)

def load_model(path="step_model.pth"):
    model = StepPredictorBig()
    model.load_state_dict(torch.load(path))
    model.eval()
    return model

# ======= 4. Использование =======

def predict_next_step(model, patch, goal_offset, map_size):
    map_width, map_height = map_size[1], map_size[0]
    scale = torch.tensor([map_width, map_height], dtype=torch.float32)

    patch_tensor = torch.tensor(patch, dtype=torch.float32).unsqueeze(0).unsqueeze(0) / 2.0
    goal_offset_normalized = torch.tensor(goal_offset, dtype=torch.float32) / scale
    goal_tensor = goal_offset_normalized.unsqueeze(0)

    with torch.no_grad():
        delta_normalized = model(patch_tensor, goal_tensor).squeeze()

    delta_real = delta_normalized * scale
    return delta_real.numpy()

# def simulate_walk(model, map_matrix, start, goal, max_steps=5000, goal_threshold=10, patch_size=11):
#     path = [start]
#     current_pos = np.array(start, dtype=np.float32)
#     map_height, map_width = map_matrix.shape
#     scale = np.array([map_width, map_height])
#
#     for i in range(max_steps):
#         patch = extract_patch(map_matrix, current_pos, size=patch_size)
#         goal_offset = goal - current_pos
#         goal_offset_normalized = goal_offset / scale
#
#         patch_tensor = torch.tensor(patch, dtype=torch.float32).unsqueeze(0).unsqueeze(0) / 2.0
#         goal_tensor = torch.tensor(goal_offset_normalized, dtype=torch.float32).unsqueeze(0)
#
#         with torch.no_grad():
#             delta_normalized = model(patch_tensor, goal_tensor).squeeze().numpy()
#
#         delta_real = delta_normalized * scale
#         next_pos = current_pos + delta_real
#
#         path.append(next_pos.copy())
#         current_pos = next_pos
#
#         if np.linalg.norm(current_pos - goal) < goal_threshold:
#             print("Цель достигнута.")
#             break
#
#         current_pos[0] = np.clip(current_pos[0], 0, map_width - 1)
#         current_pos[1] = np.clip(current_pos[1], 0, map_height - 1)
#
#     return path

def simulate_walk(model, map_matrix, start, goal, max_steps=5000, goal_threshold=10, patch_size=11):
    path = [start]
    current_pos = np.array(start, dtype=np.float32)
    map_height, map_width = map_matrix.shape
    scale = np.array([map_width, map_height], dtype=np.float32)  # Важно: порядок [width, height]

    for i in range(max_steps):
        # Извлекаем патч с текущей позиции (конвертируем в int для извлечения)
        current_pos_int = current_pos.astype(np.int32)
        patch = extract_patch(map_matrix, current_pos_int, size=patch_size)

        # Нормализация goal offset
        goal_offset = goal - current_pos
        goal_offset_normalized = goal_offset / scale  # Делим на размер карты

        # Преобразование в тензоры
        patch_tensor = torch.tensor(patch, dtype=torch.float32).unsqueeze(0).unsqueeze(0) / 2.0
        goal_tensor = torch.tensor(goal_offset_normalized, dtype=torch.float32).unsqueeze(0)

        # Предсказание
        with torch.no_grad():
            delta_normalized = model(patch_tensor, goal_tensor).squeeze().numpy()

        # Обратная нормализация: умножаем на размер карты и округляем
        delta_real = (delta_normalized * scale).round().astype(np.int32)  # <-- Важное изменение!

        # Обновляем позицию
        next_pos = current_pos + delta_real

        # Ограничиваем координаты и конвертируем в int
        next_pos[0] = np.clip(next_pos[0], 0, map_width - 1).item()
        next_pos[1] = np.clip(next_pos[1], 0, map_height - 1).item()

        # if map_matrix[int(next_pos[1]), int(next_pos[0])] == 1:
        #     print("Шаг в здание! Корректируем...")
        #     # Пример корректировки: отмена шага
        #     next_pos = current_pos.copy()

        # Сохраняем как целые числа
        path.append(next_pos.astype(np.int32).tolist())

        # Проверка достижения цели
        if np.linalg.norm(next_pos - goal) < goal_threshold:
            print("Цель достигнута.")
            break

        current_pos = next_pos

    return path

# ======= 5. Пример запуска =======

def start_model(polygons, trajectory):
    # model_loaded = load_model("step_model_щдв.pth")
    patch_size = 11
    map_size = (1080, 1920)
    print(polygons, trajectory)
    type_mapping = {
        'Трава': 'grass',
        'Здание': 'building'
    }

    # Преобразование
    output = {
        "polygons": [
            {
                "type": type_mapping[poly['type']],
                "points": poly['points']
            } for poly in polygons.values()
        ],
        "trajectory": trajectory
    }

    # Если нужно вывести как JSON:
    import json
    data = json.loads(json.dumps(output, ensure_ascii=False))
    map_matrix = build_map(data, map_size=map_size)
    start = data["trajectory"][0]
    goal = data["trajectory"][-1]

    model_loaded = load_model("RL/step_model_щдв.pth")
    simulated_path = simulate_walk(model_loaded, map_matrix, start, goal, patch_size=patch_size)
    return simulated_path
if __name__ == "__main__":
    patch_size = 11
    map_size = (1080, 1920)

    # folder = "examples"
    # dataset = load_all_datasets(folder, map_size=map_size, patch_size=patch_size)

    # if not dataset:
    #     print("Недостаточно данных.")
    #     exit()

    # model = StepPredictorBig()
    # train_model(model, dataset, map_size=map_size, epochs=100, batch_size=32, lr=0.001)
    # save_model(model, "step_model.pth")

    start_model(None,None)

    # model_loaded = load_model("step_model_щдв.pth")
    #
    # # Тестирование предсказания
    # data = json_to_dataset('map_52.json', map_size=map_size, patch_size=patch_size)
    # test_patch, test_goal, test_delta = data[2]
    # predicted_delta = predict_next_step(model_loaded, test_patch, test_goal, map_size)
    # print("Предсказанное смещение:", predicted_delta)
    # print("Реальное смещение:", test_delta)
    #
    # # Симуляция пути
    # new_json = "map_52_ed.json"
    # with open(new_json, 'r') as f:
    #     data = json.load(f)
    # map_matrix = build_map(data, map_size=map_size)
    # start = data["trajectory"][0]
    # goal = data["trajectory"][-1]
    # simulated_path = simulate_walk(model_loaded, map_matrix, start, goal, patch_size=patch_size)
    # print("Пройденный путь:", simulated_path)