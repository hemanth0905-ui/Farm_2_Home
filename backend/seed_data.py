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
            "images": ["https://www.bing.com/images/search?view=detailV2&ccid=7sXD1I8T&id=CE01910BB2418453FCFB0C6D838F1F9D1508B7F8&thid=OIP.7sXD1I8TuX9VresgBYIzGgHaE7&mediaurl=https%3a%2f%2fgetyourleanon.com%2fwp-content%2fuploads%2f2014%2f09%2fFotolia_60393337_Subscription_Monthly_M.jpg&exph=1124&expw=1690&q=fresh+organic+tomatoes+images&FORM=IRPRST&ck=CBB6C24E37BD0C00F7776A1273BA0608&selectedIndex=0&itb=0"],
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
            "images": ["https://www.bing.com/images/search?view=detailV2&ccid=Mw4YOTtG&id=81DE9D0F429D3F98F42A1AC381A678FDB23857A5&thid=OIP.Mw4YOTtGClR0jc-JM82PRgHaJ4&mediaurl=https%3a%2f%2fcdn9.dissolve.com%2fp%2fD943_187_247%2fD943_187_247_1200.jpg&exph=1200&expw=900&q=fresh+carrots&FORM=IRPRST&ck=A00C93522A5DB2DD3BA7B0264B0B3322&selectedIndex=5&itb=0"],
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
            "images": ["https://organictoyourdoor.co.uk/wp-content/uploads/3308-1.jpg"],
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
            "images": ["https://tse2.mm.bing.net/th/id/OIP.l1Y3spDeFxMkmUEaFBabFQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3"],
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
            "images": ["https://foodinstitute.com/wp-content/uploads/2023/04/qllcbktsyai.jpg"],
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
            "images": ["https://tse3.mm.bing.net/th/id/OIP.Afd0PuJB2peXHTc_Ayx2xQAAAA?rs=1&pid=ImgDetMain&o=7&rm=3"],
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
            "images": ["https://img.freepik.com/premium-photo/fresh-raw-potatoes_1161277-328.jpg"],
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
            "images": ["https://thefarmersstore.com.au/cdn/shop/products/10June2022ThisWeek_sGrowerSpecial_11.png?v=1671270694&width=1080"],
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
