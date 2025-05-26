import random
import time

from api import start_server, ApiHandler
from backend.RL.ped_sim_v2 import simulate
from backend.RL.model_norm import start_model
from backend.RL.ped_sim_v3 import start


# example
# import random
# import time
# def example_task(duration):
#     time.sleep(duration)
#     if random.choice([True, False]):
#         return "Completed successfully"
#     else:
#         raise ValueError("Task failed")

def find_path(polygons, points_of_interest, size,settings):
    # {"type": "find_path", "polygons": [{"type": 2,
    #                                     "points": [[216, 249], [216, 343], [273, 307], [292, 359], [365, 296],
    #                                                [387, 113], [341, 82], [334, 140], [333, 163], [274, 199]]},
    #                                    {"type": 1,
    #                                     "points": [[200, 321], [209, 358], [239, 347], [259, 358], [232, 400],
    #                                                [196, 448], [137, 441], [130, 384]]}],
    #  "points_of_interest": [[177, 274], [271, 397], [127, 473], [411, 190], [298, 128]],
    #  "size": {"width": 500, "height": 500}}
    weights = settings['weights']
    width = size["width"]
    height = size["height"]
    pol = {}
    pol["polygons"] = polygons

    paths = start(width, height, pol, points_of_interest, weights)

    # print("ttt", polygons, points_of_interest)



    print(paths)
    return {
        "message": f"Маршрутов построено: {len(paths)}",
        "paths": paths
    }


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
