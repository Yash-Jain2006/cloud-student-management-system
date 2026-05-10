from extensions import db

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Relationships
    enrollments = db.relationship('Enrollment', back_populates='course', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Course {self.title}>'
