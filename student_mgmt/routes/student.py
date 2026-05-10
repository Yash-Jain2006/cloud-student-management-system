from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from extensions import db
from models.course import Course
from models.enrollment import Enrollment
from decorators import student_required

student_bp = Blueprint('student', __name__, url_prefix='/student')

@student_bp.route('/dashboard')
@login_required
@student_required
def dashboard():
    # Get courses the student is enrolled in
    enrolled_courses = [e.course for e in current_user.enrollments]
    return render_template('student/dashboard.html', enrolled_courses=enrolled_courses)

@student_bp.route('/courses')
@login_required
@student_required
def browse_courses():
    # Get all available courses
    all_courses = Course.query.all()
    # Find courses student is not yet enrolled in
    enrolled_course_ids = [e.course_id for e in current_user.enrollments]
    available_courses = [c for c in all_courses if c.id not in enrolled_course_ids]
    
    return render_template('student/enroll.html', courses=available_courses)

@student_bp.route('/enroll/<int:course_id>', methods=['POST'])
@login_required
@student_required
def enroll(course_id):
    course = Course.query.get_or_404(course_id)
    
    # Check if already enrolled
    existing_enrollment = Enrollment.query.filter_by(user_id=current_user.id, course_id=course_id).first()
    if existing_enrollment:
        flash(f'You are already enrolled in {course.title}.', 'info')
    else:
        new_enrollment = Enrollment(user_id=current_user.id, course_id=course_id)
        db.session.add(new_enrollment)
        db.session.commit()
        flash(f'Successfully enrolled in {course.title}!', 'success')
        
    return redirect(url_for('student.dashboard'))
