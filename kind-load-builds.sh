kind load docker-image vamsibm36/amazon-clone-frontend:1.0.0 --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-api-gateway:1.0.0 --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-user-service:1.0.0 --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-product-service:1.0.0 --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-cart-service:1.0.0 --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-order-service:1.0.0 --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-notification-service:1.0.0 --name amazon-clone