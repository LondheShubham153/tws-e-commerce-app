@Library('shared') _

pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE_NAME = 'dvharsh/easyshop-app'
        DOCKER_MIGRATION_IMAGE_NAME = 'dvharsh/easyshop-migration'
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
        GITHUB_CREDENTIALS = credentials('git-hub credentials') // GitHub credentials from Jenkins credentials
        GIT_BRANCH = "second-Go"
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials') // Docker Hub credentials from Jenkins credentials
        SONARQUBE_SERVER = 'SonarQube' // The ID of your SonarQube server in Jenkins
    }
    
    stages {
        stage('Cleanup Workspace') {
            steps {
                script {
                    clean_ws()
                }
            }
        }
        
        stage('Clone Repository') {
            steps {
                script {
                    git credentialsId: 'git-hub credentials', branch: 'second-Go', url: 'https://github.com/DV-boop/e-commerce-app.git'
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Main App Image') {
                    steps {
                        script {
                            docker.build(env.DOCKER_IMAGE_NAME, "-t ${env.DOCKER_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG} .")
                        }
                    }
                }
                
                stage('Build Migration Image') {
                    steps {
                        script {
                            docker.build(env.DOCKER_MIGRATION_IMAGE_NAME, "-t ${env.DOCKER_MIGRATION_IMAGE_NAME}:${env.DOCKER_IMAGE_TAG} -f scripts/Dockerfile.migration .")
                        }
                    }
                }
            }
        }
        
        stage('Run Unit Tests') {
            steps {
                script {
                    run_tests() // Replace with your actual testing logic, e.g., npm test, pytest, etc.
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                script {
                    // Start the SonarQube scanner
                    withSonarQubeEnv(SONARQUBE_SERVER) {
                        // Run the SonarQube scanner on your codebase
                        sh 'mvn clean verify sonar:sonar -Dsonar.projectKey=ecommerce-app -Dsonar.host.url=http://your-sonarqube-server:9000'
                        // Replace with the command suitable for your project (npm, mvn, etc.)
                    }
                }
            }
        }
        
        stage('Security Scan with Trivy') {
            steps {
                script {
                    // Create directory for results
                    trivy_scan()
                }
            }
        }
        
        stage('Push Docker Images') {
            parallel {
                stage('Push Main App Image') {
                    steps {
                        script {
                            docker.withRegistry('https://index.docker.io/v1/', credentialsId: 'docker-hub-credentials') {
                                docker.image(env.DOCKER_IMAGE_NAME).push("${env.DOCKER_IMAGE_TAG}")
                            }
                        }
                    }
                }
                
                stage('Push Migration Image') {
                    steps {
                        script {
                            docker.withRegistry('https://index.docker.io/v1/', credentialsId: 'docker-hub-credentials') {
                                docker.image(env.DOCKER_MIGRATION_IMAGE_NAME).push("${env.DOCKER_IMAGE_TAG}")
                            }
                        }
                    }
                }
            }
        }
        
        stage('Update Kubernetes Manifests') {
            steps {
                script {
                    // Check if there are any changes
                    sh 'git diff --exit-code || echo "Changes detected in Kubernetes manifests"'
                    
                    // Configure Git
                    sh 'git config --global user.name "Jenkins CI"'
                    sh 'git config --global user.email "dvharsh9@gmail.com"'
                    
                    // Stage and commit changes
                    sh 'git add kubernetes/*'
                    sh 'git commit -m "Update Kubernetes manifests with new image tag"'
                    sh 'git push https://github.com/DV-boop/e-commerce-app.git second-Go'
                }
            }
        }
    }
}
