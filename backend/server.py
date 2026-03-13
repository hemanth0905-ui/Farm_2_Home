from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import razorpay

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Razorpay configuration
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_demo')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', 'demo_secret')
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Models
class UserRole:
    CONSUMER = "consumer"
    FARMER = "farmer"
    ADMIN = "admin"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str
    phone: Optional[str] = None
    location: Optional[str] = None
    is_approved: bool = False
    is_blocked: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    phone: Optional[str] = None
    location: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    farmer_id: str
    name: str
    description: str
    category: str
    price: float
    original_price: Optional[float] = None
    unit: str
    stock: float
    is_organic: bool = False
    images: List[str] = []
    market_avg_price: Optional[float] = None
    bulk_discounts: Dict[str, float] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: float
    original_price: Optional[float] = None
    unit: str
    stock: float
    is_organic: bool = False
    images: List[str] = []
    market_avg_price: Optional[float] = None
    bulk_discounts: Optional[Dict[str, float]] = {}

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    unit: Optional[str] = None
    stock: Optional[float] = None
    is_organic: Optional[bool] = None
    images: Optional[List[str]] = None
    market_avg_price: Optional[float] = None
    bulk_discounts: Optional[Dict[str, float]] = None

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str

class CartItem(BaseModel):
    product_id: str
    quantity: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[Dict[str, Any]]
    subtotal: float
    tax: float
    delivery_charge: float
    discount: float
    total: float
    payment_id: Optional[str] = None
    payment_status: str = "pending"
    order_status: str = "pending"
    delivery_address: Dict[str, str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    items: List[Dict[str, Any]]
    delivery_address: Dict[str, str]

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    receiver_id: str
    product_id: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(BaseModel):
    receiver_id: str
    product_id: Optional[str] = None
    message: str

class PaymentOrderCreate(BaseModel):
    order_id: str
    amount: float

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    token = credentials.credentials
    payload = verify_token(token)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get('is_blocked'):
        raise HTTPException(status_code=403, detail="User is blocked")
    return user

async def require_role(user: Dict[str, Any], required_roles: List[str]):
    if user['role'] not in required_roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user_data.password)
    user_dict = user_data.model_dump(exclude={'password'})
    user_obj = User(**user_dict)
    
    if user_obj.role == UserRole.CONSUMER:
        user_obj.is_approved = True
    
    doc = user_obj.model_dump()
    doc['password'] = hashed_pw
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    token = create_token(user_obj.id, user_obj.role)
    return {"token": token, "user": user_obj.model_dump(), "message": "Registration successful"}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user.get('is_blocked'):
        raise HTTPException(status_code=403, detail="Account is blocked")
    
    if user['role'] == UserRole.FARMER and not user.get('is_approved'):
        raise HTTPException(status_code=403, detail="Account pending approval")
    
    token = create_token(user['id'], user['role'])
    user_data = {k: v for k, v in user.items() if k != 'password'}
    return {"token": token, "user": user_data}

@api_router.get("/auth/me")
async def get_me(current_user: Dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != 'password'}

# Product endpoints
@api_router.post("/products")
async def create_product(product_data: ProductCreate, current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.FARMER])
    
    if not current_user.get('is_approved'):
        raise HTTPException(status_code=403, detail="Account pending approval")
    
    product_dict = product_data.model_dump()
    product_obj = Product(**product_dict, farmer_id=current_user['id'])
    
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.products.insert_one(doc)
    return product_obj

@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    is_organic: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None
):
    query = {}
    
    if category:
        query['category'] = category
    if is_organic is not None:
        query['is_organic'] = is_organic
    if min_price is not None or max_price is not None:
        query['price'] = {}
        if min_price is not None:
            query['price']['$gte'] = min_price
        if max_price is not None:
            query['price']['$lte'] = max_price
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'description': {'$regex': search, '$options': 'i'}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product.get('updated_at'), str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
        
        reviews = await db.reviews.find({"product_id": product['id']}, {"_id": 0}).to_list(1000)
        if reviews:
            avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
            product['rating'] = round(avg_rating, 1)
            product['review_count'] = len(reviews)
        else:
            product['rating'] = 0
            product['review_count'] = 0
    
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if isinstance(product.get('updated_at'), str):
        product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    
    farmer = await db.users.find_one({"id": product['farmer_id']}, {"_id": 0, "password": 0})
    if farmer:
        product['farmer'] = farmer
    
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(1000)
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    
    if reviews:
        avg_rating = sum(r['rating'] for r in reviews) / len(reviews)
        product['rating'] = round(avg_rating, 1)
        product['review_count'] = len(reviews)
    else:
        product['rating'] = 0
        product['review_count'] = 0
    
    product['reviews'] = reviews
    
    return product

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product_data: ProductUpdate, current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.FARMER])
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product['farmer_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_dict = {k: v for k, v in product_data.model_dump().items() if v is not None}
    if update_dict:
        update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
        await db.products.update_one({"id": product_id}, {"$set": update_dict})
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated_product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.FARMER])
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product['farmer_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.products.delete_one({"id": product_id})
    return {"message": "Product deleted successfully"}

@api_router.get("/farmer/products")
async def get_farmer_products(current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.FARMER])
    
    products = await db.products.find({"farmer_id": current_user['id']}, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if isinstance(product.get('updated_at'), str):
            product['updated_at'] = datetime.fromisoformat(product['updated_at'])
    
    return products

# Review endpoints
@api_router.post("/reviews")
async def create_review(review_data: ReviewCreate, current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.CONSUMER])
    
    product = await db.products.find_one({"id": review_data.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    existing_review = await db.reviews.find_one({
        "product_id": review_data.product_id,
        "user_id": current_user['id']
    })
    if existing_review:
        raise HTTPException(status_code=400, detail="Already reviewed this product")
    
    review_dict = review_data.model_dump()
    review_obj = Review(
        **review_dict,
        user_id=current_user['id'],
        user_name=current_user['name']
    )
    
    doc = review_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.reviews.insert_one(doc)
    return review_obj

@api_router.get("/reviews/{product_id}")
async def get_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).to_list(1000)
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    return reviews

# Order endpoints
@api_router.post("/orders")
async def create_order(order_data: OrderCreate, current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.CONSUMER])
    
    subtotal = 0
    processed_items = []
    
    for item in order_data.items:
        product = await db.products.find_one({"id": item['product_id']}, {"_id": 0})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item['product_id']} not found")
        
        if product['stock'] < item['quantity']:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product['name']}")
        
        item_price = product['price']
        quantity = item['quantity']
        
        discount_applied = 0
        if product.get('bulk_discounts'):
            for qty_str, discount_pct in sorted(product['bulk_discounts'].items(), key=lambda x: float(x[0]), reverse=True):
                if quantity >= float(qty_str):
                    discount_applied = discount_pct
                    break
        
        item_total = item_price * quantity
        if discount_applied > 0:
            item_total = item_total * (1 - discount_applied / 100)
        
        subtotal += item_total
        
        processed_items.append({
            "product_id": item['product_id'],
            "product_name": product['name'],
            "farmer_id": product['farmer_id'],
            "quantity": quantity,
            "unit": product['unit'],
            "price": item_price,
            "discount": discount_applied,
            "total": item_total
        })
    
    tax = subtotal * 0.05
    delivery_charge = 50 if subtotal < 500 else 0
    total = subtotal + tax + delivery_charge
    
    order_obj = Order(
        user_id=current_user['id'],
        items=processed_items,
        subtotal=subtotal,
        tax=tax,
        delivery_charge=delivery_charge,
        discount=0,
        total=total,
        delivery_address=order_data.delivery_address
    )
    
    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.orders.insert_one(doc)
    
    for item in order_data.items:
        await db.products.update_one(
            {"id": item['product_id']},
            {"$inc": {"stock": -item['quantity']}}
        )
    
    return order_obj

@api_router.get("/orders")
async def get_orders(current_user: Dict = Depends(get_current_user)):
    query = {"user_id": current_user['id']}
    
    if current_user['role'] == UserRole.FARMER:
        products = await db.products.find({"farmer_id": current_user['id']}, {"_id": 0}).to_list(1000)
        product_ids = [p['id'] for p in products]
        query = {"items.farmer_id": current_user['id']}
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, current_user: Dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order['user_id'] != current_user['id'] and current_user['role'] != UserRole.ADMIN:
        if current_user['role'] == UserRole.FARMER:
            farmer_product = any(item.get('farmer_id') == current_user['id'] for item in order['items'])
            if not farmer_product:
                raise HTTPException(status_code=403, detail="Not authorized")
        else:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return order

# Payment endpoints
@api_router.post("/payments/create-order")
async def create_payment_order(payment_data: PaymentOrderCreate, current_user: Dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": payment_data.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order['user_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        razorpay_order = razorpay_client.order.create({
            "amount": int(payment_data.amount * 100),
            "currency": "INR",
            "receipt": payment_data.order_id[:40],
            "payment_capture": 1
        })
        
        await db.orders.update_one(
            {"id": payment_data.order_id},
            {"$set": {"razorpay_order_id": razorpay_order['id']}}
        )
        
        return {
            "razorpay_order_id": razorpay_order['id'],
            "amount": razorpay_order['amount'],
            "currency": razorpay_order['currency'],
            "key_id": RAZORPAY_KEY_ID
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment order creation failed: {str(e)}")

@api_router.post("/payments/verify")
async def verify_payment(payment_data: Dict[str, str], current_user: Dict = Depends(get_current_user)):
    razorpay_order_id = payment_data.get('razorpay_order_id')
    razorpay_payment_id = payment_data.get('razorpay_payment_id')
    razorpay_signature = payment_data.get('razorpay_signature')
    
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        
        await db.orders.update_one(
            {"razorpay_order_id": razorpay_order_id},
            {"$set": {
                "payment_id": razorpay_payment_id,
                "payment_status": "completed",
                "order_status": "confirmed"
            }}
        )
        
        return {"status": "success", "message": "Payment verified successfully"}
    except:
        await db.orders.update_one(
            {"razorpay_order_id": razorpay_order_id},
            {"$set": {"payment_status": "failed"}}
        )
        raise HTTPException(status_code=400, detail="Payment verification failed")

# Message endpoints
@api_router.post("/messages")
async def create_message(message_data: MessageCreate, current_user: Dict = Depends(get_current_user)):
    message_dict = message_data.model_dump()
    message_obj = Message(**message_dict, sender_id=current_user['id'])
    
    doc = message_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.messages.insert_one(doc)
    return message_obj

@api_router.get("/messages")
async def get_messages(user_id: Optional[str] = None, current_user: Dict = Depends(get_current_user)):
    if user_id:
        query = {
            "$or": [
                {"sender_id": current_user['id'], "receiver_id": user_id},
                {"sender_id": user_id, "receiver_id": current_user['id']}
            ]
        }
    else:
        query = {
            "$or": [
                {"sender_id": current_user['id']},
                {"receiver_id": current_user['id']}
            ]
        }
    
    messages = await db.messages.find(query, {"_id": 0}).sort("created_at", 1).to_list(1000)
    for message in messages:
        if isinstance(message.get('created_at'), str):
            message['created_at'] = datetime.fromisoformat(message['created_at'])
    
    return messages

# Admin endpoints
@api_router.get("/admin/farmers")
async def get_pending_farmers(current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.ADMIN])
    
    farmers = await db.users.find(
        {"role": UserRole.FARMER},
        {"_id": 0, "password": 0}
    ).to_list(1000)
    
    for farmer in farmers:
        if isinstance(farmer.get('created_at'), str):
            farmer['created_at'] = datetime.fromisoformat(farmer['created_at'])
    
    return farmers

@api_router.post("/admin/approve-farmer/{farmer_id}")
async def approve_farmer(farmer_id: str, current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.ADMIN])
    
    result = await db.users.update_one(
        {"id": farmer_id, "role": UserRole.FARMER},
        {"$set": {"is_approved": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    return {"message": "Farmer approved successfully"}

@api_router.post("/admin/block-user/{user_id}")
async def block_user(user_id: str, current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.ADMIN])
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_blocked": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User blocked successfully"}

@api_router.post("/admin/unblock-user/{user_id}")
async def unblock_user(user_id: str, current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.ADMIN])
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_blocked": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User unblocked successfully"}

@api_router.get("/admin/analytics")
async def get_analytics(current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.ADMIN])
    
    total_users = await db.users.count_documents({})
    total_farmers = await db.users.count_documents({"role": UserRole.FARMER})
    pending_approvals = await db.users.count_documents({"role": UserRole.FARMER, "is_approved": False})
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    
    orders = await db.orders.find({}, {"_id": 0}).to_list(10000)
    total_revenue = sum(order.get('total', 0) for order in orders)
    
    return {
        "total_users": total_users,
        "total_farmers": total_farmers,
        "pending_approvals": pending_approvals,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue
    }

@api_router.get("/farmer/analytics")
async def get_farmer_analytics(current_user: Dict = Depends(get_current_user)):
    await require_role(current_user, [UserRole.FARMER])
    
    products = await db.products.find({"farmer_id": current_user['id']}, {"_id": 0}).to_list(1000)
    product_ids = [p['id'] for p in products]
    
    orders = await db.orders.find(
        {"items.farmer_id": current_user['id']},
        {"_id": 0}
    ).to_list(10000)
    
    total_revenue = 0
    total_orders = 0
    product_sales = {}
    
    for order in orders:
        for item in order['items']:
            if item.get('farmer_id') == current_user['id']:
                total_revenue += item.get('total', 0)
                total_orders += 1
                
                product_id = item['product_id']
                if product_id not in product_sales:
                    product_sales[product_id] = {
                        "name": item.get('product_name', 'Unknown'),
                        "quantity": 0,
                        "revenue": 0
                    }
                product_sales[product_id]['quantity'] += item.get('quantity', 0)
                product_sales[product_id]['revenue'] += item.get('total', 0)
    
    top_products = sorted(
        [
            {"product_id": k, **v}
            for k, v in product_sales.items()
        ],
        key=lambda x: x['revenue'],
        reverse=True
    )[:5]
    
    return {
        "total_products": len(products),
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "top_products": top_products
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()