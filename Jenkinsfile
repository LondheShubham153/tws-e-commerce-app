@Library('Shared') _

pipeline {
    agent any
    
    environment {

        // Update the main app image name to match the deployment file
        DOCKER_HUB_USERNAME = 'delight2025'
        DOCKER_IMAGE_NAME = "${DOCKER_HUB_USERNAME}/easyshop-app"
        DOCKER_MIGRATION_IMAGE_NAME = "${DOCKER_HUB_USERNAME}/easyshop-migration"
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
        GITHUB_CREDENTIALS = credentials('gitHub Credentials')
        GIT_REPO = "https://github.com/anandghangoria1/tws-e-commerce-app.git"
        GIT_BRANCH = "add-terraform-modules"
        SONAR_HOST_URL = 'http://34.245.124.248:9000/'
        SONAR_AUTH_TOKEN = credentials('sonarqube')
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
                    clone(env.GIT_REPO,env.GIT_BRANCH)
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Main App Image') {
                    steps {
                        script {
                            docker_build(
                                imageName: env.DOCKER_IMAGE_NAME,
                                imageTag: env.DOCKER_IMAGE_TAG,
                                dockerfile: 'Dockerfile',
                                context: '.'
                            )
                        }
                    }
                }
                
                stage('Build Migration Image') {
                    steps {
                        script {
                            docker_build(
                                imageName: env.DOCKER_MIGRATION_IMAGE_NAME,
                                imageTag: env.DOCKER_IMAGE_TAG,
                                dockerfile: 'scripts/Dockerfile.migration',
                                context: '.'
                            )
                        }
                    }
                }
            }
        }
        
        stage('Run Unit Tests') {
            steps {
                script {
                    run_tests()
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
                            docker_push(
                                imageName: env.DOCKER_IMAGE_NAME,
                                imageTag: env.DOCKER_IMAGE_TAG,
                                credentials: 'docker-hub-credentials'
                            )
                        }
                    }
                }
                
                stage('Push Migration Image') {
                    steps {
                        script {
                            docker_push(
                                imageName: env.DOCKER_MIGRATION_IMAGE_NAME,
                                imageTag: env.DOCKER_IMAGE_TAG,
                                credentials: 'docker-hub-credentials'
                            )
                        }
                    }
                }
            }
        }


    

        // Add this new stage
        stage('Update Kubernetes Manifests') {
            steps {
                script {
                    update_k8s_manifests(
                        imageTag: env.DOCKER_IMAGE_TAG,
                        manifestsPath: 'kubernetes',
                        gitCredentials: 'gitHub Credentials',
                        gitUserName: 'Jenkins CI',
                        gitUserEmail: 'a9452119605@gmail.com'
                    )
                }
            }
        }

         stage('SonarQube Analysis') {
            steps {
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh 'sonar-scanner -Dsonar.projectKey=easyshop -Dsonar.sources=src'
                    }
                }
            }
        }
    }
}
