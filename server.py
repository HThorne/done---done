"""Server for Done & Done: Productivity App."""

# Requirements 
from flask import (Flask, render_template, request, flash, session, redirect, jsonify)
from passlib.hash import argon2
from jinja2 import StrictUndefined
from re import fullmatch
from os import environ
from random import choice

# From my files
from model import connect_to_db, db
import crud

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

API_KEY = environ.get('API_KEY')
CLIENT_ID = environ.get('CLIENT_ID')

points_id = 0

@app.route('/')
def homepage():
    """View homepage."""
    if session.get("user_email"):
        return redirect("/main-page")

    return render_template('homepage.html')


@app.route("/new_user", methods=["POST"])
def register_user():
    """Create a new user after checking if that user already exists."""

    email = request.form.get("email")
    password = request.form.get("password")
    rpg_class = request.form.get("class-input")
    hashed_pass = argon2.hash(request.form.get("password"))
    name = request.form.get("fname")

    # Make a regular expression and use to validate email is in correct format
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
 
    # Match pettern and email. If not match, flash warning and redirect home
    if not fullmatch(pattern, email):
        flash("Not a valid email format. Try again.", "warning")
        return redirect("/")
    
    if not len(password) > 7:
        flash("Please enter longer password.", "warning")
        return redirect("/")

    # Change the case of the first name before entering into db
    name = name.title()

    # Check if user exists by email which is the primary key
    user = crud.get_user_by_email(email)
    if user:
        flash("Cannot create an account with that email. Try again.", "warning")
    else:
        user = crud.create_user(email, hashed_pass, name, rpg_class)
        db.session.add(user)
        db.session.commit()
        flash("Account created! Please log in.", "success")

    return redirect("/")


@app.route("/login", methods=["POST"])
def process_login():
    """Process user login."""

    email = request.form.get("email")
    attempt = request.form.get("password")

    user = crud.get_user_by_email(email)
    if not user or not argon2.verify(attempt, user.password):
        flash("The email or password you entered was incorrect.", "danger")
        return redirect("/")
    else:
        # Store the user's email in session
        session["user_email"] = user.email
        flash(f"Welcome back, {user.fname}!", "success")

    return redirect("/main-page")

@app.route("/logout")
def process_logout():
    """Process user logout."""

    email = session.get("user_email")
    user = crud.get_user_by_email(email)
    del session["user_email"]
    flash(f"See you next time, {user.fname}!", "success")

    return redirect("/")


@app.route('/main-page')
def main_page():
    """View main page."""

    # Only show main page if logged in, redirect otherwise
    if not session.get("user_email"):
        return redirect("/")
    
    return render_template('main-page.html')


@app.route('/points.json', methods=["POST"])
def process_points():
    """Process user points and return as JSON."""
    email = session.get("user_email")
    user = crud.get_user_by_email(email)
    completed_tasks = request.json.get("completed")
    scores = []

    global points_id
    if points_id >= 2000000:
        points_id = 0
    
    points_id += 1


    for task in completed_tasks:
        if not crud.get_task_by_id(task):
            logged_task = crud.create_task(task, user)
            scores.append(logged_task.score)
            db.session.add(logged_task)

    db.session.commit()

    total = crud.get_total_score(user)

    if total > 250:
        user.level += 1
        archive_tasks = crud.get_all_active_tasks_by_user(user.user_id)
        
        for task in archive_tasks:
            task.status = "archive"
        
        total = crud.get_total_score(user)
        db.session.commit()


    points = {
        "ability": user.rpg_ability,
        "rpg_class": user.rpg_class,
        "level": user.level,
        "total_score": total,
        "new_scores": scores,
        "toast_id": points_id
    }

    return jsonify(points)

@app.route('/changeclass.json', methods=["POST"])
def update_rpg_class():
    """Process user's updated class and return as JSON."""

    email = session.get("user_email")
    user = crud.get_user_by_email(email)
    new_class = request.json.get("newClass")

    if new_class != user.rpg_class:
        user.rpg_class = new_class

        if new_class == 'Barbarian':
            user.rpg_ability = 'strength'
        elif new_class == 'Bard':
            user.rpg_ability = 'charisma'
        elif new_class == 'Druid':
            user.rpg_ability = 'wisdom'
        elif new_class == 'Rogue':
            user.rpg_ability = 'dexterity'
        elif new_class == 'Wizard':
            user.rpg_ability = 'intelligence'
        else:
            user.rpg_ability = 'stupidity'

        user.level = 1
        user.total_score = 0
        archive_tasks = crud.get_all_active_tasks_by_user(user.user_id)
        
        for task in archive_tasks:
            task.status = "archive"

        db.session.commit()
    
    class_info = {
        "rpg_class": user.rpg_class,
        "level": user.level,
        "total_score": user.total_score,
    }

    return jsonify(class_info)


@app.route('/random-quest.json', methods=["POST"])
def random_quest():
    """Choose a random task from JSON and return as JSON."""
    incomplete_tasks = request.json.get("incomplete")

    if incomplete_tasks:
        task_title = choice(incomplete_tasks)
    else: 
        task_title= "Go outside and touch grass. There's no other available quests."

    random_task = {
        "task_title": task_title
    }

    return jsonify(random_task)

@app.route('/quote.json')
def find_quote():
    """Return a quote with author and source as JSON."""

    quotes = open('motivational-quotes.csv')
    lines = []

    for line in quotes:
        line = line.rstrip()
        lines.append(line)

    quote = choice(lines)
    quote = quote.split("|")

    quote_info = {
        "quote": quote[0],
        "author": quote[1],
        "source": quote[2]
    }

    if quote_info["source"] == " Unknown":
        del quote_info["source"]

    print(quote_info)

    return jsonify(quote_info)


if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)
