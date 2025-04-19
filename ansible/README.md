# EasyShop Infrastructure Setup with Ansible

This directory contains Ansible configurations to automate the setup and configuration of infrastructure for the EasyShop e-commerce application.

## Directory Structure

```
ansible/
├── inventory.ini        # Host inventory file
├── ansible.cfg          # Ansible configuration
├── README.md            # This documentation
└── playbooks/           # Playbook directory
    └── setup.yml        # Main setup playbook
```

## Prerequisites

- Ansible 2.9+ installed on your local machine
- SSH access to target EC2 instances
- Proper SSH key permissions (600) for your private key

## Quick Start

1. Configure your target hosts in `inventory.ini`:

```ini
[ec2]
easyshop-server ansible_host=<YOUR_EC2_IP> ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/your-key.pem
```

2. Run the setup playbook:

```bash
ansible-playbook -i inventory.ini playbooks/setup.yml
```

## Tags

The playbook includes tags for selective execution:

```bash
# Install only Docker
ansible-playbook -i inventory.ini playbooks/setup.yml --tags "docker"

# Install only Jenkins and Java
ansible-playbook -i inventory.ini playbooks/setup.yml --tags "jenkins,java"

# Update system packages
ansible-playbook -i inventory.ini playbooks/setup.yml --tags "update"
```

## Infrastructure Components

The main playbook (`setup.yml`) installs and configures the following components:

| Component | Description | Port |
|-----------|-------------|------|
| Jenkins | CI/CD automation server | 8080 |
| Docker | Container runtime | - |
| Trivy | Container security scanner | - |
| AWS CLI | AWS command-line interface | - |
| Helm | Kubernetes package manager | - |
| kubectl | Kubernetes CLI tool | - |

## Jenkins Setup

After running the playbook, Jenkins will be available at:

```
http://<YOUR_EC2_IP>:8080
```

The initial admin password is stored in `/home/ubuntu/jenkins_info.txt` on the target machine.

### Jenkins Plugins Recommendation

For EasyShop CI/CD pipeline, we recommend installing these plugins:
- Docker Pipeline
- Kubernetes CLI
- AWS Steps
- Pipeline Utility Steps
- Blue Ocean

## Security Notes

- The playbook configures the firewall to allow only necessary ports (22, 80, 443, 8080)
- Docker is configured to allow the jenkins user to run containers
- Security scanning with Trivy is installed for container vulnerability assessment

## Troubleshooting

### Jenkins Not Starting

If Jenkins doesn't start properly:

```bash
# Check Jenkins status
ansible ec2 -i inventory.ini -m shell -a "systemctl status jenkins"

# View Jenkins logs
ansible ec2 -i inventory.ini -m shell -a "journalctl -u jenkins"
```

### Docker Permission Issues

If Docker permission issues occur:

```bash
# Restart services and apply group changes
ansible-playbook -i inventory.ini playbooks/setup.yml --tags "service"
```

## Extending the Infrastructure

To extend the infrastructure with additional components:

1. Add new tasks to the `setup.yml` playbook
2. Use appropriate tags for selective execution
3. Update firewall rules if new ports need to be exposed
4. Document changes in this README 