from flask import Blueprint, request, redirect, url_for, flash, current_app
from flask_login import login_required, current_user
from extensions import db
from models.file import File
from services.storage_service import storage_service

files_bp = Blueprint('files', __name__, url_prefix='/files')

@files_bp.route('/upload', methods=['POST'])
@login_required
def upload_file():
    if 'file' not in request.files:
        flash('No file part', 'danger')
        return redirect(request.referrer)
    
    file = request.files['file']
    if file.filename == '':
        flash('No selected file', 'danger')
        return redirect(request.referrer)

    if file:
        try:
            # Check if S3 is configured
            if current_app.config.get('AWS_S3_BUCKET') and current_app.config.get('AWS_ACCESS_KEY_ID'):
                file_url = storage_service.save_file_s3(file, current_user.id)
            else:
                # Save locally for now
                file_url = storage_service.save_file_local(file, current_user.id)
            
            # Record in database
            new_file = File(
                filename=file.filename,
                url=file_url,
                uploaded_by=current_user.id
            )
            db.session.add(new_file)
            db.session.commit()
            
            flash(f'File "{file.filename}" uploaded successfully!', 'success')
        except Exception as e:
            db.session.rollback()
            flash(f'Error uploading file: {e}', 'danger')
            
    return redirect(request.referrer)
