"""Server for Done & Done: Productivity App."""

# Requirements 
from flask import (Flask, render_template, request, flash, session, redirect, jsonify)
from passlib.hash import argon2
from jinja2 import StrictUndefined
from re import fullmatch
from os import environ

# From my files
from model import connect_to_db, db
import crud

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

API_KEY = environ.get('API_KEY')
CLIENT_ID = environ.get('CLIENT_ID')


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
    
    if not len(password) > 8:
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
        print(user.rpg_class)
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
        flash(f"Welcome back, {user.name}!", "success")

    return redirect("/main-page")


@app.route('/main-page')
def main_page():
    """View main page."""

    # Only show main page if logged in, redirect otherwise
    if not session.get("user_email"):
        return redirect("/")
    
    return render_template('main-page.html')


@app.route('/googlecredentials.json')
def send_credentials():
    """Put API_KEY and CLIENT ID in dict and jsonify for frontend."""
    credentials = {
        'API_KEY': API_KEY,
        'CLIENT_ID': CLIENT_ID
    }

    return jsonify(credentials)


if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)
