#!/usr/bin/env python3

import boto3
import sys
import os

def get_bastion_ip(region=None):
    # Use provided region or get from environment or use default
    if not region:
        region = os.environ.get('AWS_REGION', os.environ.get('AWS_DEFAULT_REGION', 'us-east-2'))
    
    print(f"Querying AWS region: {region}")
    ec2 = boto3.resource('ec2', region_name=region)
    
    # Define tag combinations to find bastion server
    tag_combinations = [
        {'key': 'Name', 'value': 'bastion'},
        {'key': 'Name', 'value': 'Bastion Server'},
        {'key': 'Name', 'value': 'DevOps-Bastion'},
        {'key': 'Name', 'value': 'DevOps-Server'},
        {'key': 'Environment', 'value': 'Bastion Server'}
    ]
    
    # Search for instances with matching tags
    for tag in tag_combinations:
        instances = ec2.instances.filter(
            Filters=[
                {'Name': f'tag:{tag["key"]}', 'Values': [tag["value"]]},
                {'Name': 'instance-state-name', 'Values': ['running']}
            ]
        )
        
        for instance in instances:
            print(f"Found Bastion Server: {instance.id}")
            
            # Return public IP if available, otherwise private IP
            if instance.public_ip_address:
                return instance.public_ip_address
            elif instance.private_ip_address:
                return instance.private_ip_address
    
    print("No Bastion Server found.")
    sys.exit(1)

def generate_inventory(ip_addresses):
    # Create inventory file in same directory as script
    inventory_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'inventory.ini')
    
    with open(inventory_path, 'w') as f:
        # Write servers section
        f.write("[servers]\n")
        for server_name, ip in ip_addresses.items():
            f.write(f"{server_name} ansible_host={ip}\n")
        f.write("\n")
        
        # Write variables section
        f.write("[servers:vars]\n")
        f.write("ansible_ssh_private_key_file=./bastion_key.pem\n")
        f.write("ansible_python_interpreter=/usr/bin/python3\n")
    
    print(f"Created inventory file with server IP: {list(ip_addresses.values())[0]}")

if __name__ == "__main__":
    # Get region from argument if provided
    region = sys.argv[1] if len(sys.argv) > 1 else None
    
    # Get IP and generate inventory
    bastion_ip = get_bastion_ip(region)
    generate_inventory({"bastion": bastion_ip})
