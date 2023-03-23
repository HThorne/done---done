"""Script to seed database."""

import os
from passlib.hash import argon2

import crud
import model
import server

# Drop and create empty test database
os.system('dropdb productivity')
os.system('createdb productivity')

model.connect_to_db(server.app, echo=False)
model.db.create_all()

# Create 10 test users
for n in range(10):
    email = f'user{n}@test.com' 
    password = argon2.hash('Test')
    name = 'Tester'

    test_user = crud.create_user(email, password, name)
    model.db.session.add(test_user)


model.db.session.commit()
