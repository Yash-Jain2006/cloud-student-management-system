from app import create_app

# AWS Elastic Beanstalk looks for a variable named 'application' in a file named 'application.py'
application = create_app()

if __name__ == "__main__":
    # This is for local testing only
    application.run()
