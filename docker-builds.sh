docker build -t vamsibm36/amazon-clone-frontend:latest ./frontend
echo ""
docker build -t vamsibm36/amazon-clone-api-gateway:latest ./services/api-gateway
echo ""
docker build -t vamsibm36/amazon-clone-user-service:latest ./services/user-service
echo ""
docker build -t vamsibm36/amazon-clone-product-service:latest ./services/product-service
echo ""
docker build -t vamsibm36/amazon-clone-cart-service:latest ./services/cart-service
echo ""
docker build -t vamsibm36/amazon-clone-order-service:latest ./services/order-service
echo ""
docker build -t vamsibm36/amazon-clone-notification-service:latest ./services/notification-service
