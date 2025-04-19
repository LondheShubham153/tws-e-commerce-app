@Library("jenkinsLibrary") _

pipeline {
    agent any
    
    environment {
        SONAR_HOME = tool "sonarQubeScanner"
        DOCKER_IMAGE = 'dvharsh/easyshop'
        DOCKER_MIGRATION_IMAGE = 'dvharsh/easyshop-migration'
        DOCKER_CREDENTIALS = "docker-hub-credentials"       // Your Docker Hub credentials
        GITHUB_CREDENTIALS = "git-hub credentials"          // Your GitHub credentials
        EMAIL_ADDRESS = "dvharsh9@gmail.com"       
    }
    
    stages {
        stage("Set Build Tags") {
            steps {
                script {
                    env.DOCKER_TAG = "${BUILD_NUMBER}"
                }
            }
        }
        stage("Clean Workspace") {
            steps {
                cleanWorkspace()
            }
        }
        stage("Code Repository") {
            steps {
                git credentialsId: "${GITHUB_CREDENTIALS}",
                    branch: "second-Go",
                    url: "https://github.com/DV-boop/e-commerce-app.git"
            }
        }
        stage("Trivy File System Scanning") {
            steps {
                trivyFileSystemScan()
            }
        }
        stage("SonarQube Quality Analysis") {
            steps {
                sonarQubeAnalysis(
                    sonarQubeTokenName: 'sonarQubeToken', 
                    sonarQubeProjectKey: 'ecom', 
                    sonarQubeProjectName: 'e-commerce', 
                    sonarQubeInstallationName: 'sonarQubeScanner',
                    sonarQubeScannerHome: "${SONAR_HOME}" 
                )
            }
        }
        stage("Docker Image Build") {
            parallel {
                stage("Build Main Docker Image") {
                    steps {
                        dockerBuild(
                            imageName: env.DOCKER_IMAGE,
                            imageTag: env.DOCKER_TAG
                        )
                    }
                }
                stage("Build Migration Docker Image") {
                    steps {
                        dockerBuild(
                            imageName: env.DOCKER_MIGRATION_IMAGE,
                            imageTag: env.DOCKER_TAG,
                            dockerfile: './scripts/Dockerfile.migration',
                            context: '.'
                        )
                    }
                }
            }
        }
        stage("Trivy Image Scanning") {
            steps {
                trivyImageScan(
                    imageName: env.DOCKER_IMAGE, 
                    imageTag: env.DOCKER_TAG
                )
            }
        }
        stage("Push Docker Image") {
            parallel {
                stage("Pushing Main Docker Image") {
                    steps {
                        dockerPush(
                            imageName: env.DOCKER_IMAGE,
                            imageTag: env.DOCKER_TAG,
                            credentialsId: env.DOCKER_CREDENTIALS
                        )
                    }
                }
                stage("Pushing Migration Docker Image") {
                    steps {
                        dockerPush(
                            imageName: env.DOCKER_MIGRATION_IMAGE,
                            imageTag: env.DOCKER_TAG,
                            credentialsId: env.DOCKER_CREDENTIALS
                        )
                    }
                }
            }
        }
    }
    post {
        always {
            emailNotification(env.EMAIL_ADDRESS, ['trivy-image-report.txt', 'trivy-fs-report.txt'])
        }
    }
}

