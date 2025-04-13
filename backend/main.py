import random
import time

from api import start_server, ApiHandler
from backend.RL.ped_sim_v2 import simulate


# example
# import random
# import time
# def example_task(duration):
#     time.sleep(duration)
#     if random.choice([True, False]):
#         return "Completed successfully"
#     else:
#         raise ValueError("Task failed")

def find_path(polygons, trajectory):
    print(polygons, trajectory)
    paths = simulate(polygons, trajectory)
    # for i in range(random.randint(1, 10)):
    #     # path = []
    #     for p in range(random.randint(5, 20)):
    #         x = random.randint(0, 1920)
    #         y = random.randint(0, 1080)
    #         path.append((x, y))
    #     paths.append(path)
    return {"message": "Маршрут построен",
            "paths": paths}


if __name__ == '__main__':
    api = ApiHandler()
    api.register_task("find_path", find_path)
    start_server(api.handle,host='0.0.0.0')

    """
    Тесты:
    {"type": "123"}
    {"type": "find_path", "duration": 15}
    {"type": "check", "uuid": ""}
    {"type": "list"}
    """
