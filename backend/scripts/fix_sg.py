import boto3
import os
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

rds = boto3.client('rds', aws_access_key_id=AWS_ACCESS_KEY_ID, aws_secret_access_key=AWS_SECRET_ACCESS_KEY, region_name=AWS_REGION)
ec2 = boto3.client('ec2', aws_access_key_id=AWS_ACCESS_KEY_ID, aws_secret_access_key=AWS_SECRET_ACCESS_KEY, region_name=AWS_REGION)

try:
    print("Fetching RDS instance details...")
    response = rds.describe_db_instances(DBInstanceIdentifier='student-db-instance')
    sg_id = response['DBInstances'][0]['VpcSecurityGroups'][0]['VpcSecurityGroupId']
    
    print(f"Updating Security Group: {sg_id}")
    ec2.authorize_security_group_ingress(
        GroupId=sg_id,
        IpPermissions=[
            {
                'IpProtocol': 'tcp',
                'FromPort': 5432,
                'ToPort': 5432,
                'IpRanges': [{'CidrIp': '0.0.0.0/0', 'Description': 'Allow all for development'}]
            }
        ]
    )
    print("✅ Successfully added inbound rule for port 5432 (PostgreSQL).")
except Exception as e:
    if 'InvalidPermission.Duplicate' in str(e):
        print("✅ Rule already exists.")
    else:
        print(f"Error: {e}")
