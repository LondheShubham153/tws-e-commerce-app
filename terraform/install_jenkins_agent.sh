#!/bin/bash

# Update system and install Java
sudo apt update
sudo apt install -y fontconfig openjdk-17-jre 

# Docker installation
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

# Agent will connect using SSH – no Jenkins service needed

