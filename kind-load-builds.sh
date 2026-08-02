kind load docker-image vamsibm36/amazon-clone-frontend:latest --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-api-gateway:latest --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-user-service:latest --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-product-service:latest --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-cart-service:latest --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-order-service:latest --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-notification-service:latest --name amazon-clone