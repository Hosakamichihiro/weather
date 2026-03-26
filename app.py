from flask import Flask, render_template, request, redirect, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from flask import redirect, session



app = Flask(__name__)
app.secret_key = "secret_key"

# DB接続
def get_db():
    return sqlite3.connect("users.db")

# -----------------
# 初期化
# -----------------
@app.route("/init")
def init():
    db = get_db()

    # ユーザーテーブル
    db.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
    """)

    # 履歴テーブル 
    db.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        city TEXT
    )
    """)

    #お気に入りテーブル
    db.execute("""
    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        city TEXT
    )
    """)

    db.commit()
    return "OK"

# -----------------
# 新規登録
# -----------------
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        db = get_db()
        db.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
        db.commit()

        return redirect("/login")

    return render_template("register.html")

# -----------------
# ログイン
# -----------------
@app.route("/login", methods=["GET", "POST"])
def login():
    if "user" in session:
        return redirect("/")

    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        db = get_db()
        user = db.execute(
            "SELECT * FROM users WHERE username=? AND password=?",
            (username, password)
        ).fetchone()

        if user:
            session["user"] = username
            return redirect("/")
        else:
            return "ログイン失敗"

    return render_template("login.html")

# -----------------
# ログアウト
# -----------------
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

# -----------------
# ログイン状態
# -----------------
def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if "user" not in session:
            return redirect("/login")
        return f(*args, **kwargs)
    return wrapper

# -----------------
#検索履歴を保存
# -----------------
@app.route("/api/save_history", methods=["POST"])
def save_history():
    if "user" not in session:
        return {"status": "NG"}

    city = request.json["city"]

    db = get_db()
    db.execute(
        "INSERT INTO history (username, city) VALUES (?, ?)",
        (session["user"], city)
    )
    db.commit()

    return {"status": "OK"}

# -----------------
#検索履歴を保存
# -----------------
@app.route("/api/get_history")
def get_history():
    if "user" not in session:
        return []

    db = get_db()
    rows = db.execute(
        "SELECT id, city FROM history WHERE username=? ORDER BY id DESC",
        (session["user"],)
    ).fetchall()

    return [{"id": r[0], "city": r[1]} for r in rows]


# -----------------
#検索履歴を削除
# -----------------
@app.route("/api/delete_history/<int:id>", methods=["DELETE"])
def delete_history(id):
    if "user" not in session:
        return []

    db = get_db()
    db.execute("DELETE FROM history WHERE id=?", (id,))
    db.commit()
    return {"status": "OK"}

# -----------------
#お気に入り地点の登録
# -----------------
@app.route("/api/add_favorite", methods=["POST"])
def add_favorite():
    if "user" not in session:
        return {"status": "NG"}

    city = request.json["city"]

    db = get_db()
    db.execute(
        "INSERT INTO favorites (username, city) VALUES (?, ?)",
        (session["user"], city)
    )
    db.commit()

    return {"status": "OK"}

# -----------------
#お気に入り地点の取得
# -----------------
@app.route("/api/get_favorites")
def get_favorites():
    if "user" not in session:
        return {"status": "NG"}

    db = get_db()
    rows = db.execute(
        "SELECT id, city FROM favorites WHERE username=?",
        (session["user"],)
    ).fetchall()

    return [{"id": r[0], "city": r[1]} for r in rows]

# -----------------
#お気に入り地点の削除
# -----------------
@app.route("/api/delete_favorite/<int:id>", methods=["DELETE"])
def delete_favorite(id):
    if "user" not in session:
        return {"status": "NG"}

    db = get_db()
    db.execute("DELETE FROM favorites WHERE id=?", (id,))
    db.commit()
    return {"status": "OK"}

# -----------------
# トップ
# -----------------
@app.route("/")
def index():
    init()
    return render_template("index.html", user=session.get("user"))

@app.route("/login")
def login_page():
    return render_template("login.html", user=session.get("user"))

@app.route("/history")
@login_required
def history_page():
    return render_template("history.html", user=session.get("user"))

@app.route("/favorites")
@login_required
def favorites_page():
    return render_template("favorites.html", user=session.get("user"))

if __name__ == "__main__":
    app.run(debug=True)