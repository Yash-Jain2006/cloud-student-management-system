import os
from werkzeug.utils import secure_filename
from flask import current_app

class StorageService:
    def __init__(self):
        # We will initialize this with app config in the route or via app factory
        pass

    def save_file_local(self, file, user_id):
        """Saves a file to the local uploads directory."""
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', str(user_id))
        os.makedirs(upload_folder, exist_ok=True)
        
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        # Return the relative URL for the database
        return f'/static/uploads/{user_id}/{filename}'

    def save_file_s3(self, file, user_id):
        """Saves a file to AWS S3."""
        import boto3
        from flask import current_app
        
        s3 = boto3.client(
            's3',
            aws_access_key_id=current_app.config['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
            region_name=current_app.config['AWS_REGION']
        )
        
        filename = secure_filename(file.filename)
        # Create a unique key for the file
        s3_key = f"uploads/{user_id}/{filename}"
        bucket = current_app.config['AWS_S3_BUCKET']
        
        s3.upload_fileobj(
            file,
            bucket,
            s3_key,
            ExtraArgs={'ACL': 'public-read'} # Assuming public read for student access
        )
        
        # Return the S3 URL
        return f"https://{bucket}.s3.{current_app.config['AWS_REGION']}.amazonaws.com/{s3_key}"

# Instance to be used across the app
storage_service = StorageService()
