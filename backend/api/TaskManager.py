import threading
from uuid import uuid4

from backend.api.Task import Task


class TaskManager:
    def __init__(self):
        self.tasks = {}

    def add_task(self, func, *args, **kwargs):
        task_id = str(uuid4())
        task = Task(func, *args, **kwargs)
        self.tasks[task_id] = task
        thread = threading.Thread(target=self._run_task, args=(task,))
        thread.start()
        return task_id

    def _run_task(self, task):
        task.run()

    def get_task_status(self, uuid):
        task = self.tasks.get(uuid)
        if task:
            return {"status": task.status, "result": task.result}
        return {"status": "error", "result": "task not found"}

    def get_tasks(self):
        return {key: value.__dict__() for key, value in self.tasks.items()}
