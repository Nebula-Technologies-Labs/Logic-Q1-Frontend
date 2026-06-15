pipeline {

    agent any

    tools {
        nodejs 'node24'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        APP_NAME = 'crm-frontend'
        NODE_OPTIONS = '--max-old-space-size=2048'
        DEPLOY_DIR = '/opt/crm-frontend'
        SLACK_CHANNEL = '#logic-q1-development'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm

                script {
                    env.GIT_COMMIT_MSG = sh(
                        script: "git log -1 --pretty=%B",
                        returnStdout: true
                    ).trim()

                    env.GIT_AUTHOR = sh(
                        script: "git log -1 --pretty=%an",
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Notify Build Started') {
            steps {
                script {

                    def buildType = env.CHANGE_ID ?
                            "PR #${env.CHANGE_ID}" :
                            env.BRANCH_NAME

                    slackSend(
                            channel: env.SLACK_CHANNEL,
                            color: '#439FE0',
                            message: """
🚀 CRM FRONTEND BUILD STARTED

Job: ${env.JOB_NAME}
Build: #${env.BUILD_NUMBER}
Branch: ${buildType}

Author: ${env.GIT_AUTHOR}

Commit:
${env.GIT_COMMIT_MSG}

${env.BUILD_URL}
"""
                    )
                }
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
        stage('Health Check') {

            when {
                branch 'master'
            }

            steps {

                sh '''
                    echo "Waiting for CRM frontend startup..."
                    sleep 20

                    echo "Checking https://crm.logiq1.com"

                    for i in {1..5}
                    do
                        if curl --fail --silent --show-error https://crm.logiq1.com > /dev/null; then
                            echo "Health check passed."
                            exit 0
                        fi

                        echo "Attempt $i failed. Retrying in 10 seconds..."
                        sleep 10
                    done

                    echo "Health check failed."
                    exit 1
                '''
            }
        }
    }

    post {

        success {

            script {

                def msg = env.CHANGE_ID ?
                """
✅ CRM FRONTEND PR BUILD SUCCESS

PR #${env.CHANGE_ID}
Title: ${env.CHANGE_TITLE}
Author: ${env.CHANGE_AUTHOR}

${env.BUILD_URL}
"""
                :
                """
✅ CRM FRONTEND DEPLOY SUCCESS

Branch: ${env.BRANCH_NAME}
Author: ${env.GIT_AUTHOR}

${env.BUILD_URL}
"""

                slackSend(
                    channel: env.SLACK_CHANNEL,
                    color: 'good',
                    message: msg
                )
            }
        }

        unstable {

            slackSend(
                channel: env.SLACK_CHANNEL,
                color: 'warning',
                message: """
⚠️ CRM FRONTEND BUILD UNSTABLE

${env.JOB_NAME}
#${env.BUILD_NUMBER}

${env.BUILD_URL}
"""
            )
        }

        failure {

            slackSend(
                channel: env.SLACK_CHANNEL,
                color: 'danger',
                message: """
❌ CRM FRONTEND BUILD FAILED

Branch: ${env.BRANCH_NAME}
Author: ${env.GIT_AUTHOR}

${env.BUILD_URL}
"""
            )
        }

        aborted {

            slackSend(
                channel: env.SLACK_CHANNEL,
                color: '#808080',
                message: """
🛑 CRM FRONTEND BUILD ABORTED

${env.JOB_NAME}
#${env.BUILD_NUMBER}

${env.BUILD_URL}
"""
            )
        }

        always {
            cleanWs()
        }
    }
}