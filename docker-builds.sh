docker build -t vamsibm36/amazon-clone-frontend:dev ./frontend
echo ""
docker build -t vamsibm36/amazon-clone-api-gateway:dev ./services/api-gateway
echo ""
docker build -t vamsibm36/amazon-clone-user-service:dev ./services/user-service
echo ""
docker build -t vamsibm36/amazon-clone-product-service:dev ./services/product-service
echo ""
docker build -t vamsibm36/amazon-clone-cart-service:dev ./services/cart-service
echo ""
docker build -t vamsibm36/amazon-clone-order-service:dev ./services/order-service
echo ""
docker build -t vamsibm36/amazon-clone-notification-service:dev ./services/notification-service
