# Esquema de Base de Datos (Supabase) - Card Academy

Para que la lógica de sobres y fragmentos funcione correctamente, necesitas crear las siguientes tablas y columnas en Supabase. 

## 1. Tabla `users` (Usuarios y Saldos)
Almacena el inventario de monedas de tus alumnos.
- `id`: `uuid` (Primary Key, puede enlazarse a `auth.users`)
- `name`: `text` (Opcional, nombre del alumno)
- `medallas`: `integer` (Default `0`) -> La moneda que ganan en desafíos.
- `fragmentos_nexo`: `integer` (Default `0`) -> La moneda pity por cartas repetidas.

## 2. Tabla `cards` (Catálogo de Cartas)
Catálogo global con todas las cartas posibles de la academia.
- `id`: `uuid` o `text` (Primary Key)
- `name`: `text` (Nombre de la carta)
- `rarity`: `text` (Las opciones exactas deben ser: `'Común'`, `'Rara'`, `'Épica'`, `'Legendaria'`)
- `pack_type`: `text` (El sobre al que pertenece: `'pack_jacobo'`, `'pack_culiacan'`, `'pack_6_7'`)
*(Puedes añadir otras columnas como imagen, descripciones, stats de atk/def, etc.)*

## 3. Tabla `user_cards` (Inventario/Álbum)
Registra qué cartas ha obtenido cada alumno de forma única (muchos-a-muchos).
- `user_id`: `uuid` (Foreign Key refiriendo a `users.id`)
- `card_id`: `uuid` o `text` (Foreign Key refiriendo a `cards.id`)
**Nota de seguridad**: Esta tabla debe tener una *Primary Key compuesta* de `(user_id, card_id)` o un constraint `UNIQUE(user_id, card_id)`. De este modo la BD jamás permitirá tener registros duplicados de manera accidental. 

---

### Recomendación de Senior: Transacciones SQL (RPC)
El código en JavaScript proporcionado funciona muy bien y sirve perfectamente como lógica de negocio. Sin embargo, al hacerse en múltiples pasos asíncronos en el cliente o servidor Node de manera desconectada (ej. descontar medallas primero y luego dar las cartas), podría haber problemas si el usuario cierra la conexión en medio del proceso (se le cobran medallas pero no recibe la carta). 

En el futuro, para el proyecto final, te recomiendo mover esta lógica a una [**Postgres Function en Supabase (RPC)**](https://supabase.com/docs/guides/database/functions) para que Todo ocurra en 1 solo paso atómico en la base de datos (se aplica todo a la vez, o falla sin cobrar nada).
