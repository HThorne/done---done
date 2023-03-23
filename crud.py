"""CRUD operations."""

from model import db, User, connect_to_db

def create_user(email, password, name):
    """Create and return a new user."""

    user = User(email=email, password=password, name=name, total_score=0)

    return user


def get_user_by_email(email):
    """Return a user by email."""

    return User.query.filter(User.email == email).first()


if __name__ == '__main__':
    from server import app
    
    connect_to_db(app)