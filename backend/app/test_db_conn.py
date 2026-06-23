import asyncio
from sqlalchemy import text
from app.core.db import engine, async_session_maker

async def test_conn():
    print("Testing connection to Supabase...")
    try:
        async with async_session_maker() as session:
            # Query the number of tailors
            result = await session.execute(text("SELECT name, locality, city FROM public.tailors"))
            tailors = result.all()
            print(f"Connection Successful! Found {len(tailors)} tailors in the database:")
            for name, locality, city in tailors:
                print(f" - {name} ({locality}, {city})")
    except Exception as e:
        print("Connection Failed!")
        print(f"Error details: {e}")
    finally:
        # Close connection engine pool
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_conn())
