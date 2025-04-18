#!/bin/bash

# Update system and install core packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y fontconfig openjdk-17-jre 

# Jenkins installation
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt-get update
sudo apt-get -y install jenkins

sudo systemctl start jenkins
sudo systemctl enable jenkins


# AWS CLI, Helm, Kubectl
sudo snap install aws-cli --classic
sudo snap install helm --classic
sudo snap install kubectl --classic

