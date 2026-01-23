# SoporteYa
Este proyecto corresponde a la prueba técnica para el rol de "Full-Stack AI Engineer" en Vivetori

## Entregables
### Base de datos
Archivo `setup.sql` en la carpeta de `/supabase`
### Microservicio de IA
- Código fuente en la carpeta `/python-api`
- Url del servicio, desplegado en Render: https://soporteya.onrender.com

### Automatización Low Code en n8n
Archivo json `SoporteYaWorkflow-n8n.json` en la carpeta `/n8n-workflow`

### Dashboard frontend
Url de la web desplegada: https://soporteya.netlify.app/

## Prompt Engineering
El análisis de sentimiento y categorización de tickets fue implementado utilizando el modelo **Qwen2.5-7B-Instruct** de Alibaba Cloud, accedido a través de la API de Hugging Face Inference🤗.

Se utilizó la técnica de **Persona Prompt Pattern**, donde se le asigna al modelo un rol específico de experto:

```
Eres un asistente experto en análisis de tickets de soporte al cliente.
```

### Estructura del Prompt

El sistema utiliza un **System Prompt** que define:

1. **El rol del modelo**: Un asistente experto en análisis de tickets de soporte
2. **La tarea específica**: Extraer categoría y sentimiento de cada ticket
3. **Las opciones válidas**: 
   - Categorías: `soporte_tecnico`, `facturacion`, `comercial`, `consulta_general`, `otro`
   - Sentimientos: `positivo`, `negativo`, `neutral`
4. **El formato de salida**: JSON estructurado con campos `category` y `sentiment`

### Técnicas Aplicadas

- **Persona Pattern**: El modelo adopta el rol de experto en soporte al cliente, lo que mejora la precisión en la clasificación
- **Output Formatting**: Se especifica explícitamente el formato JSON esperado para facilitar el parsing de la respuesta
- **Constraint Prompting**: Se limitan las opciones válidas para categoría y sentimiento, reduciendo ambigüedad
- **Temperature baja (0.1)**: Se usa una temperatura cercana a cero para obtener respuestas consistentes y determinísticas

### Validación de Respuestas

El servicio incluye validación post-procesamiento que:
- Extrae el JSON de la respuesta usando regex
- Normaliza los valores a minúsculas
- Valida que la categoría y sentimiento estén en las listas permitidas
- Asigna valores por defecto (`otro`, `neutral`) si la respuesta no es válida