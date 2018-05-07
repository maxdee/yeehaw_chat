#!/bin/bash

launch_page() {
    # Hackey check for linux system for proper wep page open command
    # (assumes Mac OS otherwise)
    if [ $(uname) == "Linux" ]
    then
        xdg-open http://127.0.0.1:8080
    else
        open http://127.0.0.1:8080
    fi
}

launch_server() {
    # First, check if node and npm are installed
    if ! hash node 2>/dev/null
    then
        echo >&2 "nodejs is not installed. install nodejs, npm and http-server before running..."
        exit 1
    fi

    if ! hash npm 2>/dev/null
    then
        echo >&2 "npm is not installed. install npm and http-server before running..."
        exit 1
    fi

    # Check if http-server is installed
    if hash http-server 2>/dev/null
    then
        http-server & launch_page
        echo "Opening page..."
    else
        echo >&2 "npm package http-server is required to serve the page."
        echo "use 'npm i -g http-server to install, then run 'http-server' from this directory. :}"
        exit 1
    fi
}

processing-java  --sketch="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )" --output=/tmp/processing --force --run &
launch_server
