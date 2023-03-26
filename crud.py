"""CRUD operations."""

from model import db, User, connect_to_db

def create_user(email, password, fname, rpg_class):
    """Create and return a new user."""

    user = User(
                email=email, 
                password=password, 
                fname=fname, 
                rpg_class=rpg_class, 
                total_score=0,
                level = 1
            )

    return user


def get_user_by_email(email):
    """Return a user by email."""

    return User.query.filter(User.email == email).first()


if __name__ == '__main__':
    from server import app
    
    connect_to_db(app)