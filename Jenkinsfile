@Library("jenkinsLibrary") _

pipeline {
    agent any
    
    environment {
        SONAR_HOME = tool "sonarQubeScanner"
        DOCKER_IMAGE = 'muhammadabdullahabrar/easyshop' 
        DOCKER_MIGRATION_IMAGE = 'muhammadabdullahabrar/easyshop-migration' 
        DOCKER_CREDENTIALS = "dockerHubCredentials"
        EMAIL_ADDRESS = "abdullahabrar4843@gmail.com"
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
                cloneRepository(
                    branch: "master",
                    repoUrl: "https://github.com/Abdullah-0-3/tws-e-commerce-app.git"
                )
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