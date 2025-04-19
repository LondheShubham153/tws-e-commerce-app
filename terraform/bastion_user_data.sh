#!/bin/bash
sudo apt-get update -y
sudo apt-get install snapd -y

# Install AWS CLI
sudo snap install aws-cli --classic

# Install Helm
sudo snap install helm --classic

# Install Kubectl
sudo snap install kubectl --classic