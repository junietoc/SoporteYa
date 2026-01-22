import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Table name in Supabase
TICKETS_TABLE = "tickets"


def get_supabase_client() -> Client:
    """
    Creates and returns a Supabase client.
    
    Requires SUPABASE_URL and SUPABASE_KEY in .env
    """
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")
    
    return create_client(url, key)


def update_ticket_as_processed(
    ticket_id: str, 
    category: str, 
    sentiment: str
) -> dict:
    """
    Updates a ticket in Supabase marking it as processed.
    
    Args:
        ticket_id: The UUID of the ticket
        category: Detected category
        sentiment: Detected sentiment
        
    Returns:
        The updated ticket data
    """
    client = get_supabase_client()
    
    response = client.table(TICKETS_TABLE).update({
        "processed": True,
        "category": category,
        "sentiment": sentiment
    }).eq("id", ticket_id).execute()
    
    if response.data:
        return response.data[0]
    return {}


def get_unprocessed_tickets() -> list:
    """
    Gets all tickets that haven't been processed yet.
    
    Useful if you want to batch process tickets.
    """
    client = get_supabase_client()
    
    response = client.table(TICKETS_TABLE).select("*").eq(
        "processed", False
    ).execute()
    
    return response.data or []


if __name__ == "__main__":
    # Test the connection
    print("Testing Supabase connection...\n")
    
    try:
        client = get_supabase_client()
        print("✓ Connected to Supabase!")
        
        # Try to fetch unprocessed tickets
        tickets = get_unprocessed_tickets()
        print(f"✓ Found {len(tickets)} unprocessed tickets")
        
    except Exception as e:
        print(f"✗ Error: {e}")
