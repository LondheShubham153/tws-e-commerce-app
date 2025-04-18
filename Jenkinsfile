@Library('Shared') _

pipeline {
    agent any
    
    environment {
        // Update the main app image name to match the deployment file
        DOCKER_IMAGE_NAME = 'ahamadb224/easyshop-app'
        DOCKER_MIGRATION_IMAGE_NAME = 'ahamadb224/easyshop-migration'
        DOCKER_IMAGE_TAG = "${BUILD_NUMBER}"
        GITHUB_CREDENTIALS = credentials('github-credentials')
        SONAR_TOKEN = credentials('sonarqube-credentials')
        GIT_REPO = "https://github.com/ahamadb224/tws-e-commerce-app.git"
        GIT_BRANCH = "master"
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
                    clone("https://github.com/ahamadb224/tws-e-commerce-app.git", "master")
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube Server') { // Name must match Jenkins > "Configure System"
                    withCredentials([string(credentialsId: 'sonarqube-credentials', variable: 'SONAR_TOKEN')]){
                        sh '''
                          sonar-scanner \
                            -Dsonar.projectKey=easyshop-app \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://34.224.213.239:9000 \
                        '''
                    }
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
                        gitCredentials: 'github-credentials',
                        gitUserName: 'Jenkins CI',
                        gitUserEmail: 'ahamadb224@gmail.com'
                    )
                }
            }
        }
    }
}
