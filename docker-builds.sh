docker build -t vamsibm36/amazon-clone-frontend:1.0.0 ./frontend
echo ""
docker build -t vamsibm36/amazon-clone-api-gateway:1.0.0 ./services/api-gateway
echo ""
docker build -t vamsibm36/amazon-clone-user-service:1.0.0 ./services/user-service
echo ""
docker build -t vamsibm36/amazon-clone-product-service:1.0.0 ./services/product-service
echo ""
docker build -t vamsibm36/amazon-clone-cart-service:1.0.0 ./services/cart-service
echo ""
docker build -t vamsibm36/amazon-clone-order-service:1.0.0 ./services/order-service
echo ""
docker build -t vamsibm36/amazon-clone-notification-service:1.0.0 ./services/notification-service
