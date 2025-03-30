import json

from backend.api.TaskManager import TaskManager


def error(message: str) -> dict[str, str]:
    return {
        "status": "error",
        "message": message
    }


class ApiHandler:
    def __init__(self):
        self._task_manager = TaskManager()
        self._registered_tasks = {}
        self._registered_instant_tasks = {}

        self.register_instant_task("check", self._task_manager.get_task_status)
        self.register_instant_task("list", self._task_manager.get_tasks)

    def register_task(self, task_name, handler_func):
        self._registered_tasks[task_name] = handler_func

    def register_instant_task(self, task_name, handler_func):
        self._registered_instant_tasks[task_name] = handler_func

    def _message_handler(self, message: str):
        try:
            data = json.loads(message)
        except json.decoder.JSONDecodeError:
            return error("Not a valid JSON")

        task_type = data.pop("type")
        if task_type in self._registered_instant_tasks:
            handler_func = self._registered_instant_tasks[task_type]
            return handler_func(**data)
        elif task_type in self._registered_tasks:
            handler_func = self._registered_tasks[task_type]
            uuid = self._task_manager.add_task(handler_func, **data)
            return {"status": "registered", "uuid": uuid}
        else:
            return error("Unknown task type")

    def handle(self, websocket):
        result = {}
        for message in websocket:
            print("raw message:", message)
            try:
                result = self._message_handler(message)
            except Exception as e:
                print(e)
                result = error("Invalid structure")
            websocket.send(json.dumps(result))
