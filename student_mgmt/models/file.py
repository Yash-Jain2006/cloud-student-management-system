from extensions import db

class File(db.Model):
    __tablename__ = 'files'

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(512), nullable=False)
    
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    uploader = db.relationship('User', back_populates='files')

    def __repr__(self):
        return f'<File {self.filename}>'
