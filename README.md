# 🧬 ExonEditor Web

Versão web do ExonEditor — funciona em qualquer dispositivo com navegador (PC, Android, iOS).

---

## Estrutura

```
exoneditor_web/
├── backend/          ← API Python (FastAPI)
│   ├── main.py
│   └── requirements.txt
└── frontend/         ← Interface React
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Deploy — Passo a Passo

### BACKEND no Render (gratuito)

1. Acesse **render.com** e crie uma conta gratuita
2. Clique em **New → Web Service**
3. Conecte ao seu GitHub (faça upload da pasta `backend/` em um repositório)
4. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Runtime:** Python 3.11
5. Clique em **Deploy**
6. Copie a URL gerada (ex: `https://exoneditor-api.onrender.com`)

---

### FRONTEND no Vercel (gratuito)

1. Acesse **vercel.com** e crie uma conta gratuita
2. Faça upload da pasta `frontend/` em um repositório GitHub
3. Importe o projeto no Vercel
4. Adicione a variável de ambiente:
   - **Nome:** `VITE_API_URL`
   - **Valor:** URL do backend do Render (ex: `https://exoneditor-api.onrender.com`)
5. Clique em **Deploy**
6. Acesse a URL gerada pelo Vercel — funciona em qualquer dispositivo

---

## Rodar localmente (para testar antes do deploy)

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Acesse: http://localhost:8000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Acesse: http://localhost:5173

> O frontend já aponta para `http://localhost:8000` por padrão quando `VITE_API_URL` não está definido.

---

## Subir para o GitHub (necessário para Render e Vercel)

Se ainda não tem Git instalado, baixe em **git-scm.com**.

```bash
# Na pasta exoneditor_web
git init
git add .
git commit -m "ExonEditor Web - versão inicial"
```

Crie um repositório em **github.com** e siga as instruções de push que o GitHub exibe.
