import boto3
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path='backend/.env')

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

if not S3_BUCKET_NAME:
    print("Error: S3_BUCKET_NAME not found in .env file.")
    exit(1)

s3 = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

cors_configuration = {
    'CORSRules': [{
        'AllowedHeaders': ['*'],
        'AllowedMethods': ['GET', 'POST', 'PUT'],
        'AllowedOrigins': ['*'],
        'ExposeHeaders': ['ETag']
    }]
}

try:
    s3.put_bucket_cors(Bucket=S3_BUCKET_NAME, CORSConfiguration=cors_configuration)
    print(f"SUCCESS: Updated CORS for bucket: {S3_BUCKET_NAME}")
    print("Your frontend is now authorized to upload files!")
except Exception as e:
    print(f"FAILED: Update CORS: {str(e)}")
