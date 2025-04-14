#!/bin/bash

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions with colored output
log_info() {
    echo -e "${BLUE}[INFO] ${1}${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] ${1}${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] ${1}${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display tool versions
display_version() {
    echo -e "${BLUE}$1:${NC} ${GREEN}$2${NC}"
}

# Function to display banner
show_banner() {
    echo -e "${BLUE}========================================${NC}"   
    echo -e "${BLUE}      DevOps Tools Installer           ${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to update system packages
update_system() {
    log_info "Updating system packages..."
    sudo apt-get update -y
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release software-properties-common unzip jq vim tar git
    log_success "System packages updated successfully"
}

# Function to install Docker following official documentation
install_docker() {
    if ! command_exists docker; then
        log_info "Installing Docker following official documentation..."
        
        # Remove any old versions
        sudo apt-get remove -y docker docker-engine docker.io containerd runc || true
        
        # Setup the repository
        sudo apt-get update
        sudo apt-get install -y \
            ca-certificates \
            curl \
            gnupg
        
        # Add Docker's official GPG key
        sudo install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        sudo chmod a+r /etc/apt/keyrings/docker.gpg
        
        # Add the repository to Apt sources
        echo \
          "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
          sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker Engine
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        # Add user to docker group
        sudo usermod -aG docker $USER
        
        log_success "Docker installed successfully following official documentation"
    else
        log_info "Docker already installed"
    fi
}

# Function to install kubectl
install_kubectl() {
    if ! command_exists kubectl; then
        log_info "Installing kubectl..."
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
        rm kubectl
        log_success "kubectl installed successfully"
    else
        log_info "kubectl already installed"
    fi
}

# Function to install AWS CLI
install_aws_cli() {
    if ! command_exists aws; then
        log_info "Installing AWS CLI..."
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
        log_success "AWS CLI installed successfully"
    else
        log_info "AWS CLI already installed"
    fi
}

# Function to install Helm
install_helm() {
    if ! command_exists helm; then
        log_info "Installing Helm..."
        curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
        chmod 700 get_helm.sh
        ./get_helm.sh
        rm get_helm.sh
        log_success "Helm installed successfully"
    else
        log_info "Helm already installed"
    fi
}

# Function to install ArgoCD CLI
install_argocd_cli() {
    if ! command_exists argocd; then
        log_info "Installing ArgoCD CLI..."
        curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
        sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
        rm argocd-linux-amd64
        log_success "ArgoCD CLI installed successfully"
    else
        log_info "ArgoCD CLI already installed"
    fi
}

# Function to install Java (required for Jenkins)
install_java() {
    if ! command_exists java; then
        log_info "Installing Java 17 (required for Jenkins)..."
        sudo apt-get update
        
        # Add the repository for Java 17
        sudo apt-get install -y software-properties-common
        sudo add-apt-repository -y ppa:openjdk-r/ppa
        sudo apt-get update
        
        # Install Java 17
        sudo apt-get install -y openjdk-17-jdk
        
        # Set Java 17 as default
        sudo update-alternatives --set java /usr/lib/jvm/java-17-openjdk-amd64/bin/java
        
        log_success "Java 17 installed successfully"
    else
        # Check Java version
        JAVA_VER=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [ "$JAVA_VER" -lt "17" ]; then
            log_info "Upgrading Java to version 17 (required for Jenkins)..."
            sudo apt-get update
            sudo apt-get install -y software-properties-common
            sudo add-apt-repository -y ppa:openjdk-r/ppa
            sudo apt-get update
            sudo apt-get install -y openjdk-17-jdk
            sudo update-alternatives --set java /usr/lib/jvm/java-17-openjdk-amd64/bin/java
            log_success "Java upgraded to version 17"
        else
            log_info "Java version 17 or higher already installed"
        fi
    fi
}

# Function to install Jenkins
install_jenkins() {
    if ! command_exists jenkins; then
        # First ensure Java is installed
        install_java
        
        log_info "Installing Jenkins..."
        sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
            https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
        echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y jenkins
        sudo systemctl enable jenkins
        sudo systemctl start jenkins
        
        # Get the initial admin password for display
        JENKINS_PASS=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword 2>/dev/null || echo "Not available yet - check /var/lib/jenkins/secrets/initialAdminPassword")
        log_info "Jenkins initial admin password: $JENKINS_PASS"
        
        log_success "Jenkins installed successfully"
    else
        log_info "Jenkins already installed"
    fi
}

# Function to setup shell completions
setup_completions() {
    log_info "Setting up shell completions..."
    BASHRC_FILE="$HOME/.bashrc"

    # Add completions if they don't exist
    grep -q "kubectl completion" $BASHRC_FILE || echo 'source <(kubectl completion bash)' >> $BASHRC_FILE
    grep -q "helm completion" $BASHRC_FILE || echo 'source <(helm completion bash)' >> $BASHRC_FILE
    grep -q "aws_completer" $BASHRC_FILE || echo 'complete -C "$(which aws_completer)" aws' >> $BASHRC_FILE
    grep -q "argocd completion" $BASHRC_FILE || echo 'source <(argocd completion bash)' >> $BASHRC_FILE

    log_success "Shell completions configured"
}

# Function to create welcome file with information about installed tools
create_welcome_file() {
    log_info "Creating welcome information file..."
    
    WELCOME_FILE="$HOME/welcome.txt"
    
    cat > $WELCOME_FILE << 'EOF'
=======================================================
          WELCOME TO YOUR DEVOPS BASTION HOST
=======================================================

This bastion host has been configured with essential DevOps tools to help
you manage your infrastructure and applications. Below is a summary of
the installed tools and their primary uses:

1. DOCKER
   Purpose: Container runtime for building and running containerized applications
   Basic usage: docker run, docker build, docker compose
   Documentation: https://docs.docker.com/

2. KUBECTL
   Purpose: Command-line tool for controlling Kubernetes clusters
   Basic usage: kubectl get, kubectl apply, kubectl describe
   Documentation: https://kubernetes.io/docs/reference/kubectl/

3. AWS CLI
   Purpose: Command-line interface for interacting with AWS services
   Basic usage: aws s3, aws ec2, aws eks
   Documentation: https://docs.aws.amazon.com/cli/

4. HELM
   Purpose: Package manager for Kubernetes applications
   Basic usage: helm install, helm upgrade, helm repo
   Documentation: https://helm.sh/docs/

5. ARGOCD CLI
   Purpose: Command-line interface for ArgoCD GitOps tool
   Basic usage: argocd app, argocd cluster, argocd repo
   Documentation: https://argo-cd.readthedocs.io/en/stable/

6. JENKINS
   Purpose: Automation server for CI/CD pipelines
   Access: http://localhost:8080
   Initial Password: Check /var/lib/jenkins/secrets/initialAdminPassword
   Dependencies: Java 17
   Documentation: https://www.jenkins.io/doc/

To get started:
- All tools are available in your PATH
- Shell completions have been set up for easier command usage
- You may need to run 'source ~/.bashrc' to enable completions
- Use '<tool-name> --help' for basic command information

For version information, run the installation script again to display
all installed tool versions.

Remember to keep all tools updated regularly for security and new features.

Happy DevOps-ing!
=======================================================
EOF

    log_success "Welcome file created at $WELCOME_FILE"
}

# Function to display versions of installed tools
display_versions() {
    echo -e "\n${BLUE}=== Installed Tools Versions ===${NC}"
    echo -e "----------------------------------------"

    # Get versions with error handling
    if command_exists docker; then
        display_version "Docker" "$(docker --version 2>/dev/null || echo 'Version unknown')"
    fi

    if command_exists kubectl; then
        display_version "kubectl" "$(kubectl version --client --output=yaml 2>/dev/null | grep -m 1 gitVersion | awk '{print $2}' || echo 'Version unknown')"
    fi

    if command_exists aws; then
        display_version "AWS CLI" "$(aws --version 2>/dev/null || echo 'Version unknown')"
    fi

    if command_exists helm; then
        display_version "Helm" "$(helm version --short 2>/dev/null || echo 'Version unknown')"
    fi

    if command_exists argocd; then
        display_version "ArgoCD CLI" "$(argocd version --client 2>/dev/null | grep 'argocd' | awk '{print $2}' || echo 'Version unknown')"
    fi

    if command_exists jenkins; then
        # Jenkins CLI typically needs a running instance, so we'll fetch from apt
        JENKINS_VER=$(dpkg -l | grep jenkins | awk '{print $3}' 2>/dev/null || echo 'Version unknown')
        display_version "Jenkins" "$JENKINS_VER"
    fi

    if command_exists java; then
        display_version "Java" "$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' || echo 'Version unknown')"
    fi

    echo -e "----------------------------------------"
}

# Main function to orchestrate the installation process
main() {
    show_banner
    update_system
    install_docker
    install_kubectl
    install_aws_cli
    install_helm
    install_argocd_cli
    install_jenkins  # This will now call install_java first
    setup_completions
    create_welcome_file
    display_versions
    
    log_success "All tools installation completed!"
    echo -e "${GREEN}Please run 'source ~/.bashrc' to apply shell completions to your current session${NC}"
    echo -e "${GREEN}Check out ~/welcome.txt for information about the installed tools${NC}"
}

# Execute the main function
main