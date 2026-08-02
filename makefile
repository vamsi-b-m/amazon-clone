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
# k8s-install-helm-chart:
# 	helm install amazon-clone helm/amazon-clone -f helm/amazon-clone/values.yaml
# k8s-get-pods:
# 	kubectl get pods -n amazon-clone
