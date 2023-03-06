"""Script to seed database."""

import os

import crud
import model
import server

os.system('dropdb productivity')
os.system('createdb productivity')

model.connect_to_db(server.app)
model.db.create_all()

for n in range(10):
    email = f'user{n}@test.com' 
    password = 'test'
    name = 'Tester'

    # Create a test user here
    test_user = crud.create_user(email, password, name)
    model.db.session.add(test_user)


model.db.session.commit()
