# terraform/variables.tf
variable "aws_region" {
    description = "AWS Region to deploy resources"
    type = string
    default = "ap-south-1"
}

variable "project_name" {
  description = "Project name used for tagging"
  type = string
  default = "amazon-clone"
}

variable "environment" {
  description = "Environment name"
  type = string
  default = "dev"
}

variable "instance_type" {
  description = "EC2 instance type"
  type = string
  default = "t3.micro"
}

variable "ami_id" {
  description = "API ID for EC2 instance"
  type = string
  default = "ami-0f58b397bc5c1f2e8"
}

variable "key_pair_name" {
  description = "AWS key pair name for SSH access"
  type = string
}

variable "allowed_ssh_ip" {
  description = "IP allowed to SSH into EC2"
  type = string
  default = "0.0.0.0/0"
}
