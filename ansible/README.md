# DevOps Bastion Host Setup - Ansible

This project automates the setup of a DevOps bastion host with essential tools for managing cloud infrastructure and applications. It uses AWS EC2 for hosting and Ansible for configuration management.

## Overview

The project consists of:

1. A Python script to find the AWS bastion host and generate an Ansible inventory file
2. Ansible playbooks and roles to install and configure DevOps tools

## Prerequisites

- Python 3.6+
- Boto3 Python library (`pip install -r requirements.txt`)
- Ansible 2.9+
- AWS credentials configured (via environment variables, AWS CLI profile, or instance role)

## Quick Start

### 1. Find Bastion Host and Generate Inventory

```bash
# Using default AWS region (us-east-2)
python main.py

# Using a specific AWS region
python main.py us-west-2
```

This will:
- Search for EC2 instances tagged as bastion hosts
- Generate an `inventory` file with the bastion host's IP address

### 2. Run the Ansible Playbook

```bash
ansible-playbook -i inventory playbook.yml
```

## Tools Installed

The following DevOps tools are installed on the bastion host:

| Tool | Purpose | Installation Role |
|------|---------|-------------------|
| Docker | Container runtime | `docker` |
| Kubectl | Kubernetes CLI | `kubectl` |
| AWS CLI | AWS command-line interface | `aws_cli` |
| Helm | Kubernetes package manager | `helm` |
| ArgoCD CLI | GitOps deployment tool | `argocd_cli` |
| Java 17 | Runtime for Jenkins | `java` |
| Jenkins | CI/CD automation server | `jenkins` |

## Project Structure

```
ansible/
├── main.py                # Python script for finding bastion host
├── requirements.txt       # Python dependencies
├── inventory              # Generated inventory file (not in version control)
├── playbook.yml           # Main Ansible playbook
└── roles/                 # Ansible roles
    ├── argocd_cli/        # ArgoCD CLI installation role
    ├── aws_cli/           # AWS CLI installation role
    ├── common/            # Common utilities and packages
    ├── docker/            # Docker installation role
    ├── helm/              # Helm installation role
    ├── java/              # Java installation role
    ├── jenkins/           # Jenkins installation role
    ├── kubectl/           # Kubectl installation role
    └── welcome/           # Welcome message role
```

## Python Script Details

The `main.py` script:
- Uses boto3 to query AWS EC2 for instances tagged as bastion hosts
- Searches through multiple possible tag combinations:
  - `Name: bastion`
  - `Name: Bastion Server`
  - `Environment: Bastion Server`
- Generates an Ansible inventory file with the discovered IP

## Ansible Playbook Details

The playbook:
- Runs on all hosts in the `servers` group (from inventory)
- Applies all roles in sequence to install and configure tools
- Requires root privileges (`become: yes`)

## Customization

- Modify the tag combinations in `main.py` to match your tagging schema
- Update SSH key path in the `generate_inventory` function based on your key location
- Adjust roles in `playbook.yml` to add or remove tools as needed
