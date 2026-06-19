# terraform/main.tf

#  ------- VPC ------------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true

  tags = {
    Name = "${var.project_name}-vpc"
    Environment = var.environment
    Project = var.project_name
  }
}

#  ------- Internet Gatway ------------------------------------------------------------
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name    = "${var.project_name}-igw"
    Environment = var.environment
  }
}

#  ------- Public Subnet ------------------------------------------------------------
resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = {
    Name    = "${var.project_name}-public-subnet"
    Environment = var.environment
  }
}

#  ------- Route Table ------------------------------------------------------------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name        = "${var.project_name}-public-rt"
    Environment = var.environment
  }
}

resource "aws_route_table_association" "public" {
  subnet_id = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

#  ------- Security Group ------------------------------------------------------------
resource "aws_security_group" "ec2" {
  name = "${var.project_name}-ec2-sg"
  description = "Security group for Amazon Clone EC2"
  vpc_id = aws_vpc.main.id

  # SSH
  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = [var.allowed_ssh_ip]
    description = "SSH access"
  }

  # Frontend
  ingress {
    from_port = 3000
    to_port = 3000
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Frontend"
  }

  # API Gateway
  ingress {
    from_port = 4000
    to_port = 4000
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "API Gateway"
  }

  # HTTP
  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }

  # RabbitMQ Management - restricted
  ingress {
    from_port = 15672
    to_port = 15672
    protocol = "tcp"
    cidr_blocks = [var.allowed_ssh_ip]
    description = "RabbitMQ Management UI"
  }

  # All outbound
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "${var.project_name}-ec2-sg"
    Environment = var.environment
  }
}

#  ------- EC2 Instance ------------------------------------------------------------
resource "aws_instance" "app_server" {
  ami = var.ami_id
  instance_type = var.instance_type
  subnet_id = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name = var.key_pair_name

user_data = <<-EOF
    #!/bin/bash
    set -e

    apt-get update -y
    apt-get install -y docker.io git curl

    systemctl enable docker
    systemctl start docker

    # Install docker compose standalone binary
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
    -o /usr/local/bin/docker-compose

    chmod +x /usr/local/bin/docker-compose

    usermod -aG docker ubuntu

    docker-compose version

    cd /opt

    git clone https://github.com/vamsi-b-m/amazon-clone.git

    chown -R ubuntu:ubuntu /opt/amazon-clone

    # create env
    cat > /opt/amazon-clone/.env << 'ENVFILE'
      DOCKERHUB_USERNAME=vamsibm36
      DEPLOY_ENV=dev
      MONGO_PORT=27017
      MONGO_INITDB_ROOT_USERNAME=admin
      MONGO_INITDB_ROOT_PASSWORD=amazon123
      USER_SERVICE_MONGO_URI=mongodb://admin:amazon123@mongo:27017/amazon_users?authSource=admin
      PRODUCT_SERVICE_MONGO_URI=mongodb://admin:amazon123@mongo:27017/amazon_products?authSource=admin
      CART_SERVICE_MONGO_URI=mongodb://admin:amazon123@mongo:27017/amazon_carts?authSource=admin
      ORDER_SERVICE_MONGO_URI=mongodb://admin:amazon123@mongo:27017/amazon_orders?authSource=admin
      REDIS_PORT=6379
      REDIS_URL=redis://redis:6379
      RABBITMQ_PORT_1=5672
      RABBITMQ_PORT_2=15672
      RABBITMQ_DEFAULT_USER=admin
      RABBITMQ_DEFAULT_PASS=amazon123
      RABBITMQ_URL=amqp://admin:amazon123@rabbitmq:5672
      JWT_SECRET=super_secret_jwt_key_amazon_clone
      USER_SERVICE_PORT=3001
      USER_SERVICE_URL=http://user-service:3001
      PRODUCT_SERVICE_PORT=3002
      PRODUCT_SERVICE_URL=http://product-service:3002
      CART_SERVICE_PORT=3003
      CART_SERVICE_URL=http://cart-service:3003
      ORDER_SERVICE_PORT=3004
      ORDER_SERVICE_URL=http://order-service:3004
      NOTIFICATION_SERVICE_PORT=3005
      API_GATEWAY_PORT=4000
      FRONTEND_PORT=80
      FRONTEND_BIND_PORT=3000
    ENVFILE

    cd /opt/amazon-clone

    sudo docker-compose -f docker-compose.prod.yaml up -d

    echo "✅ Amazon Clone setup complete!"
  EOF

  tags = {
    Name    = "${var.project_name}-server"
    Environment = var.environment
    Project = var.project_name
  }
}

#  ------- Elastic IP ------------------------------------------------------------
resource "aws_eip" "app_server" {
  instance = aws_instance.app_server.id
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
    Environment = var.project_name
  }
}
