k8s-delete-existing-cluster:
	kind delete cluster --name amazon-clone
k8s-create-cluster:
	kind create cluster --config kind-config.yaml
k8s-ingress-install:
	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
k8s-ingress-up-wait:
	kubectl wait --namespace ingress-nginx \
	--for=condition=ready pod \
	--selector=app.kubernetes.io/component=controller \
	--timeout=90s
build-images:
	sh docker-builds.sh
load-images:
	sh kind-load-builds.sh
argocd-installtion:
	kubectl create ns argocd && \
	kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
argocd-list-pods:
	sleep 180 && \
	kubectl get pods -n argocd && \
argocd-application-setup:
	kubectl apply -f argocd/app-of-apps.yaml && \
	sleep 30 & \
	kubectl port-forward svc/argocd-server -n argocd 8080:443

#	kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode && echo 

# k8s-install-helm-chart:
# 	kubectl create ns amazon-clone && \
# 	helm upgrade --install config helm/infrastructure/config -f helm/infrastructure/config/values.yaml && \
# 	helm upgrade --install secrets helm/infrastructure/secrets -f helm/infrastructure/secrets/values.yaml && \
# 	helm upgrade --install mongo helm/infrastructure/mongo -f helm/infrastructure/mongo/values.yaml && \
# 	helm upgrade --install redis helm/infrastructure/redis -f helm/infrastructure/redis/values.yaml && \
# 	helm upgrade --install rabbitmq helm/infrastructure/rabbitmq -f helm/infrastructure/rabbitmq/values.yaml && \
# 	helm upgrade --install ingress helm/infrastructure/ingress -f helm/infrastructure/ingress/values.yaml && \
# 	sleep 60 && \
# 	helm upgrade --install product-service helm/applications/product-service -f helm/applications/product-service/values.yaml && \
# 	helm upgrade --install user-service helm/applications/user-service -f helm/applications/user-service/values.yaml && \
# 	helm upgrade --install cart-service helm/applications/cart-service -f helm/applications/cart-service/values.yaml && \
# 	helm upgrade --install order-service helm/applications/order-service -f helm/applications/order-service/values.yaml && \
# 	helm upgrade --install notification-service helm/applications/notification-service -f helm/applications/notification-service/values.yaml && \
# 	sleep 30 && \
# 	helm upgrade --install api-gateway helm/applications/api-gateway -f helm/applications/api-gateway/values.yaml && \
# 	sleep 30 && \
# 	helm upgrade --install frontend helm/applications/frontend -f helm/applications/frontend/values.yaml
# k8s-get-all:
# 	kubectl get all -n amazon-clone
