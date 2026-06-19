kind load docker-image vamsibm36/amazon-clone-frontend:dev --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-api-gateway:dev --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-user-service:dev --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-product-service:dev --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-cart-service:dev --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-order-service:dev --name amazon-clone
echo ""
kind load docker-image vamsibm36/amazon-clone-notification-service:dev --name amazon-clone