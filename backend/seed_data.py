import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import bcrypt
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Clearing existing data...")
    await db.users.delete_many({})
    await db.products.delete_many({})
    await db.orders.delete_many({})
    await db.reviews.delete_many({})
    await db.messages.delete_many({})
    
    print("Creating users...")
    admin_id = str(uuid.uuid4())
    farmer1_id = str(uuid.uuid4())
    farmer2_id = str(uuid.uuid4())
    consumer1_id = str(uuid.uuid4())
    consumer2_id = str(uuid.uuid4())
    
    users = [
        {
            "id": admin_id,
            "email": "admin@modernharvest.com",
            "password": hash_password("admin123"),
            "name": "Admin User",
            "role": "admin",
            "phone": "+91 9876543210",
            "location": "Mumbai, India",
            "is_approved": True,
            "is_blocked": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": farmer1_id,
            "email": "farmer1@example.com",
            "password": hash_password("farmer123"),
            "name": "Raj Kumar",
            "role": "farmer",
            "phone": "+91 9876543211",
            "location": "Punjab, India",
            "is_approved": True,
            "is_blocked": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": farmer2_id,
            "email": "farmer2@example.com",
            "password": hash_password("farmer123"),
            "name": "Priya Sharma",
            "role": "farmer",
            "phone": "+91 9876543212",
            "location": "Maharashtra, India",
            "is_approved": True,
            "is_blocked": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": consumer1_id,
            "email": "consumer1@example.com",
            "password": hash_password("consumer123"),
            "name": "Amit Patel",
            "role": "consumer",
            "phone": "+91 9876543213",
            "location": "Delhi, India",
            "is_approved": True,
            "is_blocked": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": consumer2_id,
            "email": "consumer2@example.com",
            "password": hash_password("consumer123"),
            "name": "Sneha Reddy",
            "role": "consumer",
            "phone": "+91 9876543214",
            "location": "Bangalore, India",
            "is_approved": True,
            "is_blocked": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.users.insert_many(users)
    print(f"Created {len(users)} users")
    
    print("Creating products...")
    products = [
        {
            "id": str(uuid.uuid4()),
            "farmer_id": farmer1_id,
            "name": "Fresh Organic Tomatoes",
            "description": "Juicy, vine-ripened organic tomatoes grown without pesticides. Perfect for salads and cooking.",
            "category": "Vegetables",
            "price": 40.0,
            "original_price": 50.0,
            "unit": "kg",
            "stock": 100.0,
            "is_organic": True,
            "images": ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea"],
            "market_avg_price": 55.0,
            "bulk_discounts": {"5": 5, "10": 10},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "farmer_id": farmer1_id,
            "name": "Fresh Carrots",
            "description": "Crunchy, sweet carrots rich in vitamins. Great for salads, juices, and cooking.",
            "category": "Vegetables",
            "price": 35.0,
            "unit": "kg",
            "stock": 80.0,
            "is_organic": True,
            "images": ["https://images.unsplash.com/photo-1741515044901-58696421d24a"],
            "market_avg_price": 45.0,
            "bulk_discounts": {"5": 5, "10": 10},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "farmer_id": farmer2_id,
            "name": "Fresh Apples",
            "description": "Crisp and delicious red apples. High in fiber and antioxidants.",
            "category": "Fruits",
            "price": 120.0,
            "unit": "kg",
            "stock": 60.0,
            "is_organic": True,
            "images": ["https://images.unsplash.com/photo-1613061527119-56ad37b8a581"],
            "market_avg_price": 150.0,
            "bulk_discounts": {"5": 5, "10": 10},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "farmer_id": farmer2_id,
            "name": "Farm Fresh Milk",
            "description": "Pure, fresh milk from grass-fed cows. Rich, creamy, and nutritious.",
            "category": "Dairy",
            "price": 60.0,
            "unit": "liter",
            "stock": 50.0,
            "is_organic": True,
            "images": ["https://images.unsplash.com/photo-1576186726188-c9d70843790f"],
            "market_avg_price": 70.0,
            "bulk_discounts": {"5": 5, "10": 10},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "farmer_id": farmer1_id,
            "name": "Free Range Eggs",
            "description": "Fresh eggs from free-range chickens. Rich in protein and nutrients.",
            "category": "Dairy",
            "price": 80.0,
            "unit": "dozen",
            "stock": 40.0,
            "is_organic": True,
            "images": ["https://images.unsplash.com/photo-1635843086739-624d71f440b3"],
            "market_avg_price": 100.0,
            "bulk_discounts": {},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "farmer_id": farmer2_id,
            "name": "Organic Spinach",
            "description": "Fresh, leafy spinach packed with iron and vitamins. Perfect for healthy meals.",
            "category": "Vegetables",
            "price": 30.0,
            "unit": "kg",
            "stock": 90.0,
            "is_organic": True,
            "images": ["https://images.unsplash.com/photo-1576045057995-568f588f82fb"],
            "market_avg_price": 40.0,
            "bulk_discounts": {"5": 5, "10": 10},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "farmer_id": farmer1_id,
            "name": "Fresh Potatoes",
            "description": "Versatile potatoes perfect for any dish. Freshly harvested and cleaned.",
            "category": "Vegetables",
            "price": 25.0,
            "unit": "kg",
            "stock": 150.0,
            "is_organic": False,
            "images": ["https://images.unsplash.com/photo-1518977676601-b53f82aba655"],
            "market_avg_price": 30.0,
            "bulk_discounts": {"10": 5, "20": 10},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "farmer_id": farmer2_id,
            "name": "Organic Bananas",
            "description": "Sweet, ripe bananas rich in potassium. Great for smoothies and snacking.",
            "category": "Fruits",
            "price": 50.0,
            "unit": "dozen",
            "stock": 70.0,
            "is_organic": True,
            "images": ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e"],
            "market_avg_price": 60.0,
            "bulk_discounts": {"5": 5},
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    print(f"Created {len(products)} products")
    
    print("\\nSeed data created successfully!")
    print("\\nTest Credentials:")
    print("Admin: admin@modernharvest.com / admin123")
    print("Farmer 1: farmer1@example.com / farmer123")
    print("Farmer 2: farmer2@example.com / farmer123")
    print("Consumer 1: consumer1@example.com / consumer123")
    print("Consumer 2: consumer2@example.com / consumer123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
