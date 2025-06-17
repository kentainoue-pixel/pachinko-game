from flask import Flask, render_template, request, jsonify
import json
import random

app = Flask(__name__)

CONFIG_FILE = "config.json"

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_question", methods=["GET"])
def get_question():
    mode = random.choice(["pachinko", "medal"])
    if mode == "pachinko":
        value = random.randint(1, 124)  # 最大124玉
    else:
        value = random.randint(1, 24)   # 最大24枚
    return jsonify({"type": mode, "value": value})


@app.route("/get_config", methods=["GET"])
def get_config():
    return jsonify(load_config())

@app.route("/save_config", methods=["POST"])
def save_config():
    new_config = request.json
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(new_config, f, indent=4, ensure_ascii=False)
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
