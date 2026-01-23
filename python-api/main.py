from fastapi import FastAPI, HTTPException

from pydantic import BaseModel

from typing import Optional
from datetime import datetime

# Importamos nuestros servicios
from llm_service import TicketAnalyzer
from supabase_service import update_ticket_as_processed


app = FastAPI(
    title="SoporteYa API",
    description="Microservicio de IA para procesar tickets de soporte",
    version="1.0.0"
)


# ============================================================
# 📋 MODELOS DE DATOS (Pydantic)
# ============================================================

# Los modelos de Pydantic nos permiten:
# 1. Validar automáticamente los datos que recibimos
# 2. Generar documentación automática (Swagger)
# 3. Serializar/deserializar JSON fácilmente

class TicketInput(BaseModel):
    """
    Modelo para los datos de entrada del ticket.
    
    Atributos:
        ticket_id: ID único del ticket en Supabase
        description: El texto del ticket a procesar
        created_at: Fecha de creación del ticket
    """
    ticket_id: str
    description: str
    created_at: datetime
    # Ejemplo para la documentación automática
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "ticket_id": "123e4567-e89b-12d3-a456-426614174000",
                    "description": "Mi pedido llegó dañado y nadie me responde. Estoy muy frustrado con el servicio.",
                    "created_at": "2026-01-21T10:00:00Z"
                }
            ]
        }
    }


class TicketOutput(BaseModel):
    """
    Modelo para la respuesta del procesamiento.
    
    Atributos:
        ticket_id: ID del ticket procesado
        description: Descripción original del ticket
        category: Categoría detectada por el LLM
        sentiment: Sentimiento detectado (positivo, negativo, neutro)
        processed: Si se procesó correctamente
    """
    ticket_id: str
    description: str
    category: str
    sentiment: str
    processed: bool



@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {
        "message": "SoporteYa API está funcionando!",
        "docs": "/docs",  
        "version": "1.0.0"
    }


@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    return {"status": "healthy"}


@app.post("/process-ticket", response_model=TicketOutput)
async def process_ticket(ticket: TicketInput):
    """
    Endpoint principal para procesar un ticket de soporte.
    
    1. Recibe el texto del ticket
    2. Lo envía al LLM para extraer categoría y sentimiento
    3. Actualiza Supabase marcando como procesado
    4. Retorna el resultado
    """
    
    try:
        # 1. Analizar el ticket con el LLM
        analyzer = TicketAnalyzer()
        result = analyzer.analyze(ticket.description)
        
        # 2. Actualizar en Supabase
        update_ticket_as_processed(
            ticket_id=ticket.ticket_id,
            category=result["category"],
            sentiment=result["sentiment"]
        )
        
        # 3. Retornar resultado
        return TicketOutput(
            ticket_id=ticket.ticket_id,
            description=ticket.description,
            category=result["category"],
            sentiment=result["sentiment"],
            processed=True
        )
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al procesar el ticket: {str(e)}"
        )


if __name__ == "__main__":
    # Esto permite ejecutar: python main.py
    # En producción usaremos: uvicorn main:app
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
