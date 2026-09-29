# KŌRA Ritual Press

Mi calculadora de precios para sets press on. App instalable (PWA), funciona sin internet y guarda todo en el teléfono.

- En línea: https://disame77-pixel.github.io/kora-ritual-press/
- Lógica y fórmulas: `src/lib/calc.ts` · insumos y tiempos iniciales: `src/lib/defaults.ts`
- Pruebas (incluye la prueba de control: 2 h 42 min y $125.000): `npm test`

## Trabajar en local

```bash
npm install
npm run dev      # abre http://localhost:5173/kora-ritual-press/
npm test
npm run build    # deja la app lista en dist/
```

## Publicar

Cada `git push` a la rama `main` corre las pruebas, construye y publica en GitHub Pages
(`.github/workflows/deploy.yml`). Si el repo cambia de nombre, el base path se ajusta solo.

## Mis datos

Viven solo en el navegador del teléfono. En **Ajustes → Exportar respaldo** saco una copia en JSON;
con **Importar respaldo** la recupero en otro teléfono o después de reinstalar.
