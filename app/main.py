from fastapi import FastAPI, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from database import init_db, DB_PATH
from modelos import friendCreate
import sqlite3

app = FastAPI()

templates = Jinja2Templates(directory="templates")

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
async def read_item(request: Request):
    return templates.TemplateResponse("index2.html", {"request": request})

# endpoint para buscar tds os os amigos e suas datas de aniversário e adicionar ao frontend
@app.get("/nextbirthday")
def get_friends():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    res = cur.execute("SELECT * FROM friend")
    colunas = [desc[0] for desc in res.description]
    linhas = res.fetchall()
    resposta = [dict(zip(colunas, linha)) for linha in linhas]
    conn.close()
    #vai retornar uma lista de  dicionarios
    return resposta 
@app.get("/friends")
def get_friends():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    res = cur.execute("SELECT * FROM friend")
    colunas = [desc[0] for desc in res.description]
    linhas = res.fetchall()
    resposta = [dict(zip(colunas, linha)) for linha in linhas]
    conn.close()
    #vai retornar uma lista de  dicionarios
    return  resposta


@app.post("/add_friends/")
async def create_friend(friend: friendCreate):
    
    conn = sqlite3.connect(DB_PATH)
    # se já existe um amigo com o mesmo nome, retorna um erro
    existing_friend = conn.execute("SELECT * FROM friend WHERE name = ?", (friend.name,)).fetchone()
    if existing_friend:
        conn.close()
        raise HTTPException(status_code=400, detail="Amigo com esse nome já existe.")
    conn.execute("INSERT INTO friend (name, birthday) VALUES (?, ?)", (friend.name, friend.birthday))
    conn.commit()
    conn.close()
    return {"message": "Amigo adicionado com sucesso!"}     