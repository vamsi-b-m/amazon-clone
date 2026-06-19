# terraform/outputs.tf
output "server_public_ip" {
  description = "Public IP of the EC2 instance"
  value = aws_eip.app_server.public_ip
}

output "server_public_dns" {
  description = "Public DNS of the EC2 instance"
  value = aws_instance.app_server.public_dns
}

output "ssh_command" {
  description = "SSH command to connect to server"
  value = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_eip.app_server.public_ip}"
}

output "frontend_url" {
  description = "Frontend URL"
  value = "http://${aws_eip.app_server.public_ip}:3000"
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value = "http://${aws_eip.app_server.public_ip}:4000"
}

output "vpc_id" {
  description = "VPC ID"
  value = aws_vpc.main.id
}