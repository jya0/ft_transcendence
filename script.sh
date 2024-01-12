#!/bin/bash

# Helper script for the Makefile to change user IP from .env file when needed

GREEN='\033[0;32m'
RESET='\033[0m'

USER_IP=$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -n 1)

sed -i '' "s|HOST_IP|$USER_IP|g" .env

echo "changed "HOST_IP=$GREEN$USER_IP"$RESET"
