function HomePage() {


    return (
        <React.Fragment>
            <object data="/static/img/homepagelogo.svg" type="image/svg+xml"></object>
            <h2>Create an Account</h2>
                <form action="/new_user" method="POST">
                    <div className="mb-3 row g-3 align-items-center">
                        <div className="col-auto">
                            <label htmlFor="nameInput" className="form-label">
                                First Name
                            </label>
                        </div>
                        <div className="col-auto">
                            <input type="text" className="form-control" required={true} 
                            aria-required="true" id="nameInput" name="fname">
                            </input>
                        </div>
                    </div>
                    <div className="mb-3 row g-3 align-items-center">
                        <div className="col-auto">
                            <label htmlFor="classInput" className="form-label">
                                Choose a Class
                            </label>
                        </div>
                        <div className="col-auto">
                            <select name="class-input" className="form-select" aria-label="Select class" 
                            required={true} aria-required="true" id="classInput">
                                <option value="Barbarian">Barbarian</option>
                                <option value="Bard">Bard</option>
                                <option value="Druid">Druid</option>
                                <option value="Rogue">Rogue</option>
                                <option value="Wizard">Wizard</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-3 row g-3 align-items-center">
                        <div className="col-auto">
                            <label htmlFor="emailInput" className="form-label">
                                Email Address
                            </label>
                        </div>
                        <div className="col-auto">
                            <input type="email" name="email" className="form-control" required={true} 
                            aria-required="true" id="emailInput" placeholder="name@example.com">
                            </input>
                        </div>
                    </div>
                    <div className="row g-3 align-items-center">
                        <div className="col-auto">
                            <label htmlFor="inputPassword" className="col-form-label">
                                Password
                            </label>
                        </div>
                        <div className="col-auto">
                            <input type="password" name="password" id="inputPassword" required={true} 
                            aria-required="true" className="form-control" aria-labelledby="passwordHelpInline">
                            </input>
                        </div>
                        <div className="col-auto">
                            <span id="passwordHelpInline" className="form-text">
                                Must be 8-20 characters long.
                            </span>
                        </div>
                    </div>
                    <div className="mt-3">
                        <button type="submit" className="btn btn-secondary mb-3"> Submit </button>
                    </div>
                </form>
            
            <h2>Log In</h2>
                <form action="/login" method="POST">
                    <div className="mb-3 row g-3 align-items-center">
                        <div className="col-auto">
                            <label htmlFor="emailInput" className="form-label">
                                Email Address
                            </label>
                        </div>
                        <div className="col-auto">
                            <input type="email" name="email" className="form-control" required={true} 
                            aria-required="true" id="emailLogin">
                            </input>
                        </div>
                    </div>
                    <div className="row g-3 align-items-center">
                        <div className="col-auto">
                            <label htmlFor="passwordLogin" className="col-form-label">
                                Password
                            </label>
                        </div>
                        <div className="col-auto">
                            <input type="password" name="password" id="passwordLogin" required={true} 
                            aria-required="true" className="form-control" aria-labelledby="passwordHelpInline">
                            </input>
                        </div>
                    </div>
                    <div className="mt-3">
                        <button type="submit" className="btn btn-secondary mb-3"> Submit </button>
                    </div>
                </form>
                {/* <style>
                    {`
                        object {
                            height: auto;
                            width: 489px;
                        }
                    `}
                </style> */}
        </React.Fragment>
    )
}

ReactDOM.render(<HomePage />, document.querySelector('#create_login'));