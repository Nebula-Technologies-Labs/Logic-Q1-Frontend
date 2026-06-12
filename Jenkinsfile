pipeline {

    agent any

    tools {
        nodejs 'node24'
    }

    environment {
        DEPLOY_DIR = '/opt/crm-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {

            when {
                branch 'master'
            }

            steps {

                sh '''
                    mkdir -p ${DEPLOY_DIR}

                    rsync -av --delete \
                      --exclude node_modules \
                      --exclude .git \
                      --exclude .env \
                      ./ ${DEPLOY_DIR}/

                    cd ${DEPLOY_DIR}

                    docker compose up -d --build
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}