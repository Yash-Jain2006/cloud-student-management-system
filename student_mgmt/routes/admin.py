from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required
from extensions import db
from models.user import User
from models.course import Course
from models.enrollment import Enrollment
from decorators import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# ─── Dashboard ────────────────────────────────────────────────────────────────

@admin_bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    total_students  = User.query.filter_by(role='student').count()
    total_courses   = Course.query.count()
    total_enrollments = Enrollment.query.count()
    recent_students = User.query.filter_by(role='student').order_by(User.id.desc()).limit(5).all()
    return render_template(
        'admin/dashboard.html',
        total_students=total_students,
        total_courses=total_courses,
        total_enrollments=total_enrollments,
        recent_students=recent_students,
    )

# ─── Course CRUD ──────────────────────────────────────────────────────────────

@admin_bp.route('/courses')
@login_required
@admin_required
def manage_courses():
    courses = Course.query.all()
    return render_template('admin/manage_courses.html', courses=courses)

@admin_bp.route('/courses/create', methods=['POST'])
@login_required
@admin_required
def create_course():
    title       = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    if not title:
        flash('Course title is required.', 'danger')
        return redirect(url_for('admin.manage_courses'))

    try:
        course = Course(title=title, description=description)
        db.session.add(course)
        db.session.commit()
        flash(f'Course "{title}" created successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error creating course: {e}', 'danger')

    return redirect(url_for('admin.manage_courses'))

@admin_bp.route('/courses/delete/<int:course_id>', methods=['POST'])
@login_required
@admin_required
def delete_course(course_id):
    course = Course.query.get_or_404(course_id)
    try:
        db.session.delete(course)
        db.session.commit()
        flash(f'Course "{course.title}" deleted.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting course: {e}', 'danger')
    return redirect(url_for('admin.manage_courses'))

# ─── Student Management ───────────────────────────────────────────────────────

@admin_bp.route('/students')
@login_required
@admin_required
def manage_students():
    students = User.query.filter_by(role='student').all()
    return render_template('admin/manage_students.html', students=students)

@admin_bp.route('/students/delete/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def delete_student(user_id):
    student = User.query.get_or_404(user_id)
    if student.role == 'admin':
        flash('Cannot delete an admin account.', 'danger')
        return redirect(url_for('admin.manage_students'))
    try:
        db.session.delete(student)
        db.session.commit()
        flash(f'Student "{student.name}" removed.', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Error deleting student: {e}', 'danger')
    return redirect(url_for('admin.manage_students'))
