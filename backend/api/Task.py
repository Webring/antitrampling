class Task:
    class Status:
        PENDING = "pending"
        ERROR = "error"
        SUCCESS = "success"

    def __init__(self, func, *args, **kwargs):
        self.status = Task.Status.PENDING
        self.func = func
        self.args = args
        self.kwargs = kwargs
        self.result = None

    def run(self):
        try:
            self.result = self.func(*self.args, **self.kwargs)
            self.status = Task.Status.SUCCESS
        except Exception as e:
            self.result = str(e)
            self.status = Task.Status.ERROR

    def __dict__(self):
        return {"status": self.status, "result": self.result}