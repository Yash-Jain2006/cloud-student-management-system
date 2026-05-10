from extensions import db

class Enrollment(db.Model):
    __tablename__ = 'enrollments'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), primary_key=True)
    
    # For progress tracking (e.g., 0 to 100)
    progress = db.Column(db.Integer, default=0)

    # Relationships
    user = db.relationship('User', back_populates='enrollments')
    course = db.relationship('Course', back_populates='enrollments')

    def __repr__(self):
        return f'<Enrollment User:{self.user_id} Course:{self.course_id}>'
