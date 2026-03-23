# Deploy do site (Vercel e Render)

## 1) Ajuste os links do botão de download

O arquivo `index.html` ja esta configurado com:

- `https://github.com/cesarcatga/GeneEditor/releases/latest`
- `https://github.com/cesarcatga/GeneEditor`

Se quiser usar outro repositorio no futuro, altere esses dois links.

## 2) Subir para o Git

```powershell
git add index.html styles.css vercel.json render.yaml DEPLOY_WEB.md
git commit -m "feat: landing page para deploy em vercel e render"
git push
```

## 3) Deploy no Vercel

1. Entre em https://vercel.com/new
2. Importe o repositório.
3. Framework Preset: `Other`.
4. Build Command: deixe vazio.
5. Output Directory: deixe vazio.
6. Deploy.

O Vercel vai publicar automaticamente o `index.html` da raiz.

## 4) Deploy no Render

1. Entre em https://dashboard.render.com
2. Clique em `New +` -> `Static Site`.
3. Conecte o mesmo repositório.
4. O Render detecta o `render.yaml` automaticamente.
5. Clique em `Create Static Site`.

## 5) Publicar versão do app para download

Para o botão de download funcionar melhor, publique o `ExonEditor.zip` em uma Release do GitHub:

1. Abra o repositório no GitHub.
2. Crie uma `Release` (tag ex.: `v1.0.0`).
3. Anexe o arquivo `dist/ExonEditor.zip`.
4. Salve a release.

Depois disso, o botão "Baixar versão estável" passa a apontar para a última release.