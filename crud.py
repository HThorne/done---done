"""CRUD operations."""

from model import db, User, Task, connect_to_db
from random import randint

def create_user(email, password, fname, rpg_class):
    """Create and return a new user."""

    if rpg_class == 'barbarian':
        rpg_ability = 'strength'
    elif rpg_class == 'bard':
        rpg_ability = 'charisma'
    elif rpg_class == 'druid':
        rpg_ability = 'wisdom'
    elif rpg_class == 'rogue':
        rpg_ability = 'dexterity'
    elif rpg_class == 'wizard':
        rpg_ability = 'intelligence'
    else:
        rpg_ability = 'stupidity'

    user = User(
                email=email, 
                password=password, 
                fname=fname, 
                rpg_class=rpg_class,
                rpg_ability=rpg_ability, 
                total_score=0,
                level = 1
            )

    return user


def get_user_by_email(email):
    """Return a user by email."""

    return User.query.filter(User.email == email).first()


def create_task(task_id, email):
    """Create and return a new task."""

    user = get_user_by_email(email)
    user_id = user.user_id
    score = randint(1, 20)

    task = Task(
                task_id=task_id,
                user_id=user_id,
                score=score
    )

    return task


def get_task_by_id(id):
    """Return a task by id."""

    return Task.query.filter(Task.task_id == id).first()


def get_all_tasks_by_user(user_id):
    """Return all tasks from a user."""

    return Task.query.filter(Task.user_id == user_id).all()


def get_total_score(email):
    """Find all tasks from a user and sum score with modifiers. Return new total"""
    user = get_user_by_email(email)
    user_id = user.user_id

    tasks = get_all_tasks_by_user(user_id)
    total_score = 0

    for task in tasks:
        total_score += (task.score + 2)

    user.total_score = total_score
    db.session.commit()

    return total_score


if __name__ == '__main__':
    from server import app
    
    connect_to_db(app)