#!/bin/bash

# Update system and install core packages
sudo apt update -y
sudo apt install -y fontconfig openjdk-17-jre

# Docker installation
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
sudo usermod -aG docker jenkins
sudo systemctl restart docker

# Install Trivy
sudo apt-get install wget apt-transport-https gnupg lsb-release snapd -y
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update -y
sudo apt-get install trivy -y


# AWS CLI, Helm, Kubectl
sudo snap install aws-cli --classic
sudo snap install helm --classic
sudo snap install kubectl --classic