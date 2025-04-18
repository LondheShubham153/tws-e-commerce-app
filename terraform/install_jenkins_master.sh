#!/bin/bash

# Update system and install core packages
sudo apt update
sudo apt install -y fontconfig openjdk-17-jre 

# SonarQube Install
sudo apt update && sudo apt install -y unzip
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.4.1.88267.zip
unzip sonarqube-10.4.1.88267.zip
sudo mv sonarqube-10.4.1.88267 /opt/sonarqube
sudo adduser --system --no-create-home --group --disabled-login sonar
sudo chown -R sonar:sonar /opt/sonarqube
cd /opt/sonarqube/bin/linux-x86-64
sudo -u sonar ./sonar.sh start
sudo chown -R jenkins:jenkins /var/lib/jenkins


# AWS CLI, Helm, Kubectl
sudo snap install aws-cli --classic
sudo snap install helm --classic
sudo snap install kubectl --classic

