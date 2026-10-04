pipeline {
    agent any

    tools {
        nodejs 'Node-v20.15.0'
    }

    parameters {
        choice(name: 'ENV', choices: ['stg', 'prod'], description: 'Deployment Environment')
    }

    environment {
        APP_NAME = 'notification-admin'
        DOCKER_REGISTRY = 'docker-registry.excellencekits.com'
        DOCKER_IMAGE = "${DOCKER_REGISTRY}/${APP_NAME}"
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Checking out source code for ${env.APP_NAME}..."
                    checkout scm
                }
            }
        }

        stage('NPM Install & Build') {
            steps {
                script {
                    echo 'Installing dependencies and building Next.js application...'
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Copy K8s Config') {
            steps {
                script {
                    echo "Copying Kubernetes configuration for ${env.APP_NAME}..."
                    def sourcePath = "/var/jenkins_home/workspace/k8s-deployment/k8s-deployment/${env.APP_NAME}"
                    sh """
                        mkdir -p k8s-configs/${env.APP_NAME}
                        if [ -d "${sourcePath}" ]; then
                            cp -rv ${sourcePath}/* k8s-configs/${env.APP_NAME}/
                        else
                            echo "WARN: Config source not found at ${sourcePath}. Checking workspace..."
                        fi
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    env.IMAGE_TAG = "${env.DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                    echo "Building Docker image: ${env.IMAGE_TAG}..."
                    sh "docker build -t ${env.IMAGE_TAG} ."
                }
            }
        }

        stage('Publish Docker Image') {
            steps {
                script {
                    echo "Publishing Docker image: ${env.IMAGE_TAG}..."
                    withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS} ${env.DOCKER_REGISTRY}"
                        sh "docker push ${env.IMAGE_TAG}"
                    }
                }
            }
        }

        stage('Deploy to K8s') {
            when {
                expression { return params.ENV != null }
            }
            steps {
                script {
                    echo "Deploying ${env.APP_NAME} to ${params.ENV} environment..."
                    def propsPath = "k8s-configs/${env.APP_NAME}/${params.ENV}.properties"
                    if (!fileExists(propsPath)) {
                        echo "Warning: Properties file missing at ${propsPath}. Skipping automatic kubectl apply."
                        return
                    }

                    def props = readProperties file: propsPath
                    def template = "k8s-configs/${env.APP_NAME}/deployment.yaml"

                    sh """
                        cp /etc/rancher/rke2/rke2.yaml ./tmp_kubeconfig || true
                        sed -i 's|127.0.0.1|host.docker.internal|g' ./tmp_kubeconfig || true

                        cp ${template} deployment_gen.yaml

                        sed -i 's|\\\${IMAGE_TAG}|${env.IMAGE_TAG}|g'                                          deployment_gen.yaml
                        sed -i 's|\\\${K8S_NAMESPACE}|${props.K8S_NAMESPACE}|g'                                deployment_gen.yaml
                        sed -i 's|\\\${CPU_REQUEST}|${props.CPU_REQUEST}|g'                                     deployment_gen.yaml
                        sed -i 's|\\\${MEMORY_REQUEST}|${props.MEMORY_REQUEST}|g'                               deployment_gen.yaml
                        sed -i 's|\\\${CPU_LIMIT}|${props.CPU_LIMIT}|g'                                         deployment_gen.yaml
                        sed -i 's|\\\${MEMORY_LIMIT}|${props.MEMORY_LIMIT}|g'                                   deployment_gen.yaml
                        sed -i 's|\\\${MIN_REPLICAS}|${props.MIN_REPLICAS}|g'                                   deployment_gen.yaml
                        sed -i 's|\\\${MAX_REPLICAS}|${props.MAX_REPLICAS}|g'                                   deployment_gen.yaml
                        sed -i 's|\\\${PROFILE}|${props.PROFILE}|g'                                             deployment_gen.yaml
                        sed -i 's|\\\${NODE_PORT}|${props.NODE_PORT}|g'                                         deployment_gen.yaml
                        sed -i 's|\\\${SERVICE_PORT}|${props.SERVICE_PORT}|g'                                   deployment_gen.yaml
                        sed -i 's|\\\${PERSISTENT_VOLUME_CLAIM_NAME}|${props.PERSISTENT_VOLUME_CLAIM_NAME}|g'   deployment_gen.yaml
                        sed -i 's|\\\${INGRES_HOST}|${props.INGRES_HOST}|g'                                     deployment_gen.yaml
                        sed -i 's|\\\${NEXT_PUBLIC_NOTIFICATION_API_SERVER}|${props.NEXT_PUBLIC_NOTIFICATION_API_SERVER}|g' deployment_gen.yaml
                        sed -i 's|\\\${NEXT_PUBLIC_API_SERVER}|${props.NEXT_PUBLIC_API_SERVER}|g'               deployment_gen.yaml
                        sed -i 's|\\\${NEXT_PUBLIC_APPLICATION_HOST}|${props.NEXT_PUBLIC_APPLICATION_HOST}|g'   deployment_gen.yaml
                        sed -i 's|\\\${NEXT_PUBLIC_OAUTH2_CLIENT_ID}|${props.NEXT_PUBLIC_OAUTH2_CLIENT_ID}|g'   deployment_gen.yaml
                        sed -i 's|\\\${NEXT_PUBLIC_OAUTH2_CLIENT_SECRET}|${props.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET}|g' deployment_gen.yaml
                        sed -i 's|\\\${NEXT_PUBLIC_OAUTH2_SERVER}|${props.NEXT_PUBLIC_OAUTH2_SERVER}|g'       deployment_gen.yaml

                        kubectl --kubeconfig=./tmp_kubeconfig apply -f deployment_gen.yaml -n ${props.K8S_NAMESPACE} --insecure-skip-tls-verify || true
                        rm -f ./tmp_kubeconfig
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline for ${env.APP_NAME} completed successfully."
        }
        failure {
            echo "Pipeline for ${env.APP_NAME} failed."
        }
    }
}
