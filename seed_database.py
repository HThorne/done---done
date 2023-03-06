"""Script to seed database."""

import os
from passlib.hash import pbkdf2_sha256

import crud
import model
import server

os.system('dropdb productivity')
os.system('createdb productivity')

model.connect_to_db(server.app, echo=False)
model.db.create_all()

for n in range(10):
    email = f'user{n}@test.com' 
    password = pbkdf2_sha256.hash('Test')
    name = 'Tester'

    # Create a test user here
    test_user = crud.create_user(email, password, name)
    model.db.session.add(test_user)


model.db.session.commit()
