from websockets.sync.server import serve


def start_server(handler, host="localhost", port=8765):
    with serve(handler, host, port) as server:
        print(f"Server running on ws://{host}:{port}")
        server.serve_forever()
