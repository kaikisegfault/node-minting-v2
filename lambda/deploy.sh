#!/bin/bash
set -e

FUNCTION_NAME="NodeMintQueue"
REGION="us-east-1"

echo "Packaging Lambda function..."
mkdir -p dist
cp index.mjs dist/
cp package.json dist/

cd dist
npm install --omit=dev --silent
zip -r ../lambda-deploy.zip . -q

cd ..
echo "Deploying to AWS Lambda ($FUNCTION_NAME)..."
aws lambda update-function-code \
    --function-name $FUNCTION_NAME \
    --zip-file fileb://lambda-deploy.zip \
    --region $REGION

echo "Cleaning up..."
rm -rf dist lambda-deploy.zip

echo "Deployed successfully!"
