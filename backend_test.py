import requests
import json
import sys
from datetime import datetime

class FarmToTableAPITester:
    def __init__(self, base_url="https://farmer-connect-27.preview.emergentagent.com"):
        self.base_url = base_url
        self.tokens = {}
        self.test_data = {}
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, token_type=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if token_type and token_type in self.tokens:
            test_headers['Authorization'] = f'Bearer {self.tokens[token_type]}'
        elif headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        print(f"   Expected Status: {expected_status}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.text else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION ENDPOINTS")
        print("="*50)

        # Test registration for consumer
        success, response = self.run_test(
            "Consumer Registration",
            "POST",
            "auth/register",
            200,
            data={
                "name": "Test Consumer",
                "email": f"testconsumer_{datetime.now().strftime('%H%M%S')}@test.com",
                "password": "testpass123",
                "role": "consumer",
                "phone": "+91 9876543210",
                "location": "Test City"
            }
        )
        
        if success and 'token' in response:
            self.tokens['consumer'] = response['token']
            self.test_data['consumer_email'] = f"testconsumer_{datetime.now().strftime('%H%M%S')}@test.com"
            print(f"   Consumer token saved")

        # Test login with existing admin account
        success, response = self.run_test(
            "Admin Login",
            "POST", 
            "auth/login",
            200,
            data={
                "email": "admin@modernharvest.com",
                "password": "admin123"
            }
        )
        
        if success and 'token' in response:
            self.tokens['admin'] = response['token']
            print(f"   Admin token saved")

        # Test login with existing farmer account
        success, response = self.run_test(
            "Farmer Login",
            "POST",
            "auth/login", 
            200,
            data={
                "email": "farmer1@example.com",
                "password": "farmer123"
            }
        )
        
        if success and 'token' in response:
            self.tokens['farmer'] = response['token']
            print(f"   Farmer token saved")

        # Test consumer login
        success, response = self.run_test(
            "Consumer Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": "consumer1@example.com", 
                "password": "consumer123"
            }
        )
        
        if success and 'token' in response:
            self.tokens['consumer'] = response['token']
            print(f"   Consumer token saved")

        # Test me endpoint
        if 'admin' in self.tokens:
            self.run_test(
                "Get Current User (Admin)",
                "GET",
                "auth/me",
                200,
                token_type='admin'
            )

    def test_product_endpoints(self):
        """Test product management endpoints"""
        print("\n" + "="*50)
        print("TESTING PRODUCT ENDPOINTS")
        print("="*50)

        # Test get products (public endpoint)
        success, response = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        
        if success and response and len(response) > 0:
            self.test_data['sample_product_id'] = response[0]['id']
            print(f"   Found {len(response)} products")
            print(f"   Sample product ID saved: {response[0]['id']}")

        # Test product filtering
        self.run_test(
            "Get Products with Category Filter",
            "GET",
            "products?category=Vegetables",
            200
        )

        self.run_test(
            "Get Organic Products",
            "GET", 
            "products?is_organic=true",
            200
        )

        # Test search
        self.run_test(
            "Search Products",
            "GET",
            "products?search=tomato",
            200
        )

        # Test get single product
        if 'sample_product_id' in self.test_data:
            self.run_test(
                "Get Single Product",
                "GET",
                f"products/{self.test_data['sample_product_id']}",
                200
            )

        # Test create product (farmer only)
        if 'farmer' in self.tokens:
            success, response = self.run_test(
                "Create Product (Farmer)",
                "POST",
                "products",
                200,
                data={
                    "name": "Test Tomatoes",
                    "description": "Fresh organic tomatoes from our farm",
                    "category": "Vegetables",
                    "price": 45.0,
                    "unit": "kg",
                    "stock": 100.0,
                    "is_organic": True,
                    "bulk_discounts": {"10": 5, "20": 10}
                },
                token_type='farmer'
            )
            
            if success and 'id' in response:
                self.test_data['created_product_id'] = response['id']
                print(f"   Created product ID: {response['id']}")

        # Test farmer products endpoint
        if 'farmer' in self.tokens:
            self.run_test(
                "Get Farmer Products",
                "GET",
                "farmer/products",
                200,
                token_type='farmer'
            )

    def test_review_endpoints(self):
        """Test review endpoints"""
        print("\n" + "="*50)
        print("TESTING REVIEW ENDPOINTS")
        print("="*50)

        # Test create review (consumer only)
        if 'consumer' in self.tokens and 'sample_product_id' in self.test_data:
            success, response = self.run_test(
                "Create Product Review",
                "POST",
                "reviews",
                200,
                data={
                    "product_id": self.test_data['sample_product_id'],
                    "rating": 5,
                    "comment": "Excellent quality vegetables!"
                },
                token_type='consumer'
            )

        # Test get reviews for product
        if 'sample_product_id' in self.test_data:
            self.run_test(
                "Get Product Reviews",
                "GET",
                f"reviews/{self.test_data['sample_product_id']}",
                200
            )

    def test_order_endpoints(self):
        """Test order management endpoints"""
        print("\n" + "="*50)
        print("TESTING ORDER ENDPOINTS")
        print("="*50)

        # Test create order (consumer only)
        if 'consumer' in self.tokens and 'sample_product_id' in self.test_data:
            success, response = self.run_test(
                "Create Order",
                "POST",
                "orders",
                200,
                data={
                    "items": [
                        {
                            "product_id": self.test_data['sample_product_id'],
                            "quantity": 2
                        }
                    ],
                    "delivery_address": {
                        "name": "Test User",
                        "address": "123 Test Street",
                        "city": "Test City",
                        "state": "Test State",
                        "pincode": "123456",
                        "phone": "+91 9876543210"
                    }
                },
                token_type='consumer'
            )
            
            if success and 'id' in response:
                self.test_data['created_order_id'] = response['id']
                print(f"   Created order ID: {response['id']}")

        # Test get orders
        if 'consumer' in self.tokens:
            self.run_test(
                "Get Consumer Orders",
                "GET",
                "orders",
                200,
                token_type='consumer'
            )

        # Test get specific order
        if 'consumer' in self.tokens and 'created_order_id' in self.test_data:
            self.run_test(
                "Get Specific Order",
                "GET",
                f"orders/{self.test_data['created_order_id']}",
                200,
                token_type='consumer'
            )

    def test_payment_endpoints(self):
        """Test payment endpoints"""
        print("\n" + "="*50)
        print("TESTING PAYMENT ENDPOINTS")
        print("="*50)

        # Test create payment order
        if 'consumer' in self.tokens and 'created_order_id' in self.test_data:
            self.run_test(
                "Create Payment Order",
                "POST",
                "payments/create-order",
                200,
                data={
                    "order_id": self.test_data['created_order_id'],
                    "amount": 150.0
                },
                token_type='consumer'
            )

    def test_admin_endpoints(self):
        """Test admin endpoints"""
        print("\n" + "="*50)
        print("TESTING ADMIN ENDPOINTS")
        print("="*50)

        if 'admin' in self.tokens:
            # Test get analytics
            self.run_test(
                "Get Admin Analytics",
                "GET",
                "admin/analytics",
                200,
                token_type='admin'
            )

            # Test get farmers
            success, response = self.run_test(
                "Get All Farmers",
                "GET",
                "admin/farmers",
                200,
                token_type='admin'
            )
            
            if success and response and len(response) > 0:
                # Find an unapproved farmer
                unapproved_farmer = None
                for farmer in response:
                    if not farmer.get('is_approved'):
                        unapproved_farmer = farmer
                        break
                
                if unapproved_farmer:
                    farmer_id = unapproved_farmer['id']
                    
                    # Test approve farmer
                    self.run_test(
                        "Approve Farmer",
                        "POST",
                        f"admin/approve-farmer/{farmer_id}",
                        200,
                        token_type='admin'
                    )

    def test_farmer_endpoints(self):
        """Test farmer-specific endpoints"""
        print("\n" + "="*50)
        print("TESTING FARMER ENDPOINTS")
        print("="*50)

        if 'farmer' in self.tokens:
            self.run_test(
                "Get Farmer Analytics",
                "GET",
                "farmer/analytics", 
                200,
                token_type='farmer'
            )

    def test_message_endpoints(self):
        """Test messaging endpoints"""
        print("\n" + "="*50)
        print("TESTING MESSAGE ENDPOINTS")
        print("="*50)

        if 'consumer' in self.tokens and 'farmer' in self.tokens:
            # Test send message
            success, response = self.run_test(
                "Send Message",
                "POST",
                "messages",
                200,
                data={
                    "receiver_id": "farmer-id-placeholder",
                    "message": "Hello, I'm interested in your products!"
                },
                token_type='consumer'
            )

            # Test get messages
            self.run_test(
                "Get Messages",
                "GET", 
                "messages",
                200,
                token_type='consumer'
            )

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting Farm-to-Table API Testing Suite")
        print("=" * 80)
        
        self.test_auth_endpoints()
        self.test_product_endpoints()
        self.test_review_endpoints()
        self.test_order_endpoints()
        self.test_payment_endpoints()
        self.test_admin_endpoints()
        self.test_farmer_endpoints()
        self.test_message_endpoints()
        
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("\n🎉 All tests passed! API is working correctly.")
            return 0
        else:
            print(f"\n⚠️  {self.tests_run - self.tests_passed} test(s) failed. Check the logs above.")
            return 1

def main():
    tester = FarmToTableAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())