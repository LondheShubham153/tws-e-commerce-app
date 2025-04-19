#!/bin/bash

# Update system and install core packages
sudo apt update
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

# Docker installation
sudo apt-get update
sudo apt-get install docker.io -y

# User group permission
sudo usermod -aG docker $USER
sudo usermod -aG docker jenkins

sudo systemctl restart docker
sudo systemctl restart jenkins

# Install dependencies and Trivy
sudo apt-get install wget apt-transport-https gnupg lsb-release snapd -y
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update -y
sudo apt-get install trivy -y

# AWS CLI installation
sudo snap install aws-cli --classic

# Helm installation
sudo snap install helm --classic

# Kubectl installation
sudo snap install kubectl --classic

#Postgresql Installation for sonarqube
sudo apt install -y postgresql-common postgresql -y
sudo systemctl enable postgresql
sudo systemctl start postgresql

#SONARQUBE INSTALLATION
#Since Java already installed for Jenkins, no need to install Java
#Few configuration changes need to change after VM got created. Look into Readme file
sudo apt update
sudo apt install unzip
sudo wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-25.2.0.102705.zip
unzip sonarqube-25.2.0.102705.zip
sudo mv sonarqube-25.2.0.102705/ /opt/sonarqube
sudo adduser --system --no-create-home --group --disabled-login sonarqube
sudo chown -R sonarqube:sonarqube /opt/sonarqube

#SONARSCANNER INSTALLATION
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-7.0.1.4817-linux-x64.zip
unzip sonar-scanner-cli-7.0.1.4817-linux-x64.zip
sudo mv sonar-scanner-7.0.1.4817-linux-x64/  /opt/sonarscanner
