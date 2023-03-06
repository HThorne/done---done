"""Server for productivity app."""

from flask import (Flask, render_template, request, flash, session,
                   redirect)
from model import connect_to_db, db, User
import crud

from passlib.hash import pbkdf2_sha256

from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined


@app.route('/')
def homepage():
    """View homepage."""

    return render_template('homepage.html')


@app.route("/new_user", methods=["POST"])
def register_user():
    """Create a new user."""

    email = request.form.get("email")
    hashed_pass = pbkdf2_sha256.hash(request.form.get("password"), 
                                        rounds=200000, 
                                        salt_size=16)
    name = request.form.get("fname")

    user = crud.get_user_by_email(email)
    if user:
        flash("Cannot create an account with that email. Try again.", "warning")
    else:
        user = crud.create_user(email, hashed_pass, name)
        db.session.add(user)
        db.session.commit()
        flash("Account created! Please log in.", "success")

    return redirect("/")

@app.route("/login", methods=["POST"])
def process_login():
    """Process user login."""

    email = request.form.get("email")
    password = request.form.get("password")

    user = crud.get_user_by_email(email)
    if not user or not pbkdf2_sha256.verify(password, user.password):
        flash("The email or password you entered was incorrect.", "danger")
    else:
        # Store the user's email in session
        session["user_email"] = user.email
        flash(f"Welcome back, {user.name}!", "success")

    return redirect("/")




if __name__ == "__main__":
    connect_to_db(app)
    app.run(host="0.0.0.0", debug=True)