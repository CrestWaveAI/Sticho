import asyncio
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from app.core.db import engine, async_session_maker
from app.models.tailor import Tailor
from app.schemas.tailor import TailorPublicResponse

async def verify_models_and_schemas():
    print("Verifying SQLAlchemy models and Pydantic schemas...")
    try:
        async with async_session_maker() as session:
            # Query all tailors loading locations and services + categories
            stmt = (
                select(Tailor)
                .options(
                    selectinload(Tailor.location),
                    selectinload(Tailor.services).selectinload(
                        # We need to import Category to make sure the relationship works,
                        # but SQLAlchemy resolves the string path.
                        # We use selectinload to load the nested categories relationship.
                        "category"
                    )
                )
            )
            result = await session.execute(stmt)
            tailors = result.scalars().all()
            
            print(f"\nFound {len(tailors)} tailors in Supabase DB.")
            print("\nSerializing to Pydantic TailorPublicResponse...")
            
            for tailor_orm in tailors:
                # Validate and serialize ORM model to Pydantic Response schema
                tailor_pydantic = TailorPublicResponse.model_validate(tailor_orm)
                
                print(f"\nTailor: {tailor_pydantic.name}")
                if tailor_pydantic.location:
                    print(f"  Location: {tailor_pydantic.location.name}, {tailor_pydantic.location.city}")
                print(f"  Verified: {tailor_pydantic.is_verified}")
                print(f"  Rating: {tailor_pydantic.rating} ({tailor_pydantic.reviews_count} reviews)")
                print(f"  Resolved Categories (Computed Field): {tailor_pydantic.categories}")
                # Ensure contact number is hidden
                assert not hasattr(tailor_pydantic, "contact_number"), "Error: contact_number should be hidden in Public Response!"
                
            print("\nVerification Successful! All models mapped and Pydantic serialization executed without errors.")
    except Exception as e:
        print("\nVerification Failed!")
        print(f"Error details: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify_models_and_schemas())
