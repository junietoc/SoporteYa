import os
import json
import re
from dotenv import load_dotenv

from huggingface_hub import InferenceClient

load_dotenv()

MODEL_ID = "Qwen/Qwen2.5-7B-Instruct"

VALID_CATEGORIES = [
    "soporte_tecnico",
    "facturacion",
    "comercial",
    "consulta_general",
    "otro"
]

VALID_SENTIMENTS = ["positivo", "negativo", "neutral"]

SYSTEM_PROMPT = """Eres un asistente experto en análisis de tickets de soporte al cliente.

Tu tarea es analizar tickets y extraer:
1. La CATEGORÍA del ticket (una de las siguientes: {categories})
2. El SENTIMIENTO del cliente (uno de los siguientes: {sentiments})

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido, sin texto adicional.
Formato: {{"category": "categoria_aqui", "sentiment": "sentimiento_aqui"}}"""


def build_messages(ticket_text: str) -> list:
    """
    Construye los mensajes en formato chat.
    """
    categories = ", ".join(VALID_CATEGORIES)
    sentiments = ", ".join(VALID_SENTIMENTS)
    
    return [
        {
            "role": "system",
            "content": SYSTEM_PROMPT.format(categories=categories, sentiments=sentiments)
        },
        {
            "role": "user", 
            "content": f'Analiza este ticket:\n"{ticket_text}"'
        }
    ]


class TicketAnalyzer:
    """
    Servicio para analizar tickets usando Mistral-7B.
    """
    
    def __init__(self):
        api_key = os.getenv("HUGGINGFACE_API_KEY")
        if not api_key:
            raise ValueError("API key no encontrada")
        
        self.client = InferenceClient(
            model=MODEL_ID,
            token=api_key,
        )
    
    def _parse_response(self, response: str) -> dict:
        try:
            json_match = re.search(r'\{[^}]+\}', response)
            if json_match:
                result = json.loads(json_match.group())
                
                if "category" in result and "sentiment" in result:
                    category = result["category"].lower().strip()
                    sentiment = result["sentiment"].lower().strip()
                    
                    if category not in VALID_CATEGORIES:
                        category = "otro"
                    
                    if sentiment not in VALID_SENTIMENTS:
                        sentiment = "neutral"
                    
                    return {"category": category, "sentiment": sentiment}
            
            return {"category": "otro", "sentiment": "neutral"}
            
        except json.JSONDecodeError:
            return {"category": "otro", "sentiment": "neutral"}
    
    def analyze(self, ticket_text: str) -> dict:
        messages = build_messages(ticket_text)
        
        # chat_completion for conversational models
        response = self.client.chat_completion(
            messages=messages,
            max_tokens=100,
            temperature=0.1,
        )
        
        content = response.choices[0].message.content
        return self._parse_response(content)


if __name__ == "__main__":
    print("Probando el servicio de análisis de tickets...\n")
    
    analyzer = TicketAnalyzer()
    
    test_tickets = [
        "Mi pedido llegó completamente dañado y nadie me responde. Estoy furioso!",
        "¿Cuánto cuesta el envío a Medellín?",
        "Muchas gracias por la rápida atención, excelente servicio!",
    ]
    
    for ticket in test_tickets:
        print(f"Ticket: {ticket[:50]}...")
        result = analyzer.analyze(ticket)
        print(f"   → Categoría: {result['category']}")
        print(f"   → Sentimiento: {result['sentiment']}\n")
