#!/bin/bash

# Jenkins credentials
JENKINS_USER="mark"
JENKINS_PASS="Markisawesome"
JENKINS_URL="http://localhost:8080"

# Function to get CSRF token (Jenkins-Crumb)
get_crumb() {
  CRUMB=$(curl -s -u "${JENKINS_USER}:${JENKINS_PASS}" "${JENKINS_URL}/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,\":\"//crumb)")
  
  if [ -z "$CRUMB" ]; then
    echo "Failed to get CSRF token. Check your credentials."
    exit 1
  fi
  
  echo "Successfully authenticated with Jenkins!"
  echo "CSRF token obtained: ${CRUMB}"
}

# Function to trigger a build for a specific job
trigger_build() {
  local job_name=$1
  
  echo "Triggering build for ${job_name} job..."
  curl -X POST -u "${JENKINS_USER}:${JENKINS_PASS}" -H "${CRUMB}" "${JENKINS_URL}/job/${job_name}/build"
  
  echo "Build triggered for ${job_name}. Check Jenkins UI for progress."
}

