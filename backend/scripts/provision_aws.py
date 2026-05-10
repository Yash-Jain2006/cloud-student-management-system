import boto3
import os
import time
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Initialize boto3 clients
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

rds_client = boto3.client(
    'rds',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def create_s3_bucket(bucket_name):
    print(f"--- Creating S3 Bucket: {bucket_name} ---")
    try:
        if AWS_REGION == "us-east-1":
            s3_client.create_bucket(Bucket=bucket_name)
        else:
            s3_client.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={'LocationConstraint': AWS_REGION}
            )
        print(f"Successfully created bucket: {bucket_name}")
        return True
    except Exception as e:
        print(f"Error creating bucket: {e}")
        return False

def create_rds_instance(db_instance_id, db_name, master_username, master_password):
    print(f"--- Provisioning RDS Instance (PostgreSQL): {db_instance_id} ---")
    print("Note: This may take 5-10 minutes to become available.")
    try:
        response = rds_client.create_db_instance(
            DBInstanceIdentifier=db_instance_id,
            AllocatedStorage=20,
            DBInstanceClass='db.t3.micro',
            Engine='postgres',
            MasterUsername=master_username,
            MasterUserPassword=master_password,
            DBName=db_name,
            PubliclyAccessible=True,
            VpcSecurityGroupIds=[], # Will use default if empty, but better to specify
            Tags=[{'Key': 'Project', 'Value': 'StudentManagement'}]
        )
        print(f"RDS Instance creation initiated. Status: {response['DBInstance']['DBInstanceStatus']}")
        return True
    except Exception as e:
        print(f"Error creating RDS instance: {e}")
        return False

def update_env_file(bucket_name, db_url):
    print("--- Updating .env file ---")
    with open(".env", "r") as f:
        lines = f.readlines()
    
    with open(".env", "w") as f:
        for line in lines:
            if line.startswith("S3_BUCKET_NAME="):
                f.write(f"S3_BUCKET_NAME={bucket_name}\n")
            elif line.startswith("DATABASE_URL="):
                f.write(f"DATABASE_URL={db_url}\n")
            else:
                f.write(line)
    print(".env file updated successfully.")

if __name__ == "__main__":
    # Settings
    unique_suffix = int(time.time())
    bucket_name = f"student-mgmt-uploads-{unique_suffix}"
    db_instance_id = "student-db-instance"
    db_name = "studentdb"
    db_user = "postgres_admin"
    db_password = "SecurePassword123!" # In a real app, use Secrets Manager
    
    # 1. Create S3
    if create_s3_bucket(bucket_name):
        # 2. Create RDS
        if create_rds_instance(db_instance_id, db_name, db_user, db_password):
            # We don't have the endpoint yet, so we'll put a placeholder or wait.
            # For now, let's update the S3 name and a partial DB URL.
            placeholder_db_url = f"postgresql://{db_user}:{db_password}@YOUR_RDS_ENDPOINT:5432/{db_name}"
            update_env_file(bucket_name, placeholder_db_url)
            print("\nPROVISIONING STARTED!")
            print(f"Bucket Name: {bucket_name}")
            print("Please wait a few minutes, then check your AWS RDS console for the endpoint address.")
            print("Once the status is 'Available', replace 'YOUR_RDS_ENDPOINT' in .env with the actual endpoint.")
