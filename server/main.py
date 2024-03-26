from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def getNotes():
    return "Here is some data"