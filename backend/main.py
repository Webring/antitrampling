import random
import time

from api import start_server, ApiHandler
from backend.RL.ped_sim_v2 import simulate
from backend.RL.model_norm import start_model


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
    paths = [start_model(polygons, trajectory)]
    print(paths)
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
