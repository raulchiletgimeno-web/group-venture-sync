

## Plan: Mostrar fecha de creación en cada gasto

### Cambio

En `src/pages/trips/Expenses.tsx`, añadir una línea con la fecha formateada (`created_at`) en cada tarjeta de gasto de la pestaña "Gastos".

El campo `created_at` ya existe en la interfaz `Expense` y se obtiene de la base de datos, así que no hace falta ningún cambio en backend ni en la query.

### Implementación

En la sección de renderizado de cada gasto (línea ~504), añadir debajo del título una línea mostrando la fecha formateada:

```tsx
<p className="text-xs text-muted-foreground mt-0.5">
  {new Date(exp.created_at).toLocaleDateString(getLocale(language), { day: "numeric", month: "short", year: "numeric" })}
</p>
```

Se usará `getLocale(language)` que ya está importado en el archivo para formatear según el idioma del usuario.

Un solo archivo modificado, sin cambios en base de datos.

