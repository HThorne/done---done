function HomePage() {


    return (
        <React.Fragment>
            <object data="/static/img/homepagelogo.svg" type="image/svg+xml"></object>
            <h3>Create an Account</h3>
                <form action="/new_user" method="POST">
                    <div className="mb-3 row g-3 align-items-center">
                        <div className="col-auto">
                            <input type="text" className="form-control form-control-sm" required={true} 
                            aria-required="true" id="nameInput" placeholder="First Name" name="fname">
                            </input>
                        </div>
                    </div>
                    <div className="mb-3 row g-3 align-items-center">
                        <div className="col-auto">
                            <select name="class-input" className="form-select form-select-sm" aria-label="Select class" 
                            required={true} aria-required="true" id="classInput">
                                <option selected disabled>Choose an RPG Class</option>
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
                            <input type="email" name="email" className="form-control form-control-sm" required={true} 
                            aria-required="true" id="emailInput" placeholder="Email">
                            </input>
                        </div>
                    </div>
                    <div className="row g-3 align-items-center">
                        <div className="col-auto">
                            <input type="password" name="password" id="inputPassword" required={true} 
                            aria-required="true" className="form-control form-control-sm" placeholder="Create Password" aria-labelledby="passwordHelpInline">
                            </input>
                        </div>
                    </div>                        
                    <div className="col-auto">
                            <span id="passwordHelpInline" className="form-text">
                                Must be 8-20 characters long.
                            </span>
                        </div>
                    <div className="mt-3">
                        <button type="submit" className="btn btn-success btn-sm mb-3"> Submit </button>
                    </div>
                </form>
            
            <h3 className="mt-3">Log In</h3>
                <form action="/login" method="POST">
                    <div className="mb-3 row g-3 align-items-center">
                        <div className="col-auto">
                            <input type="email" name="email" className="form-control form-control-sm" required={true} 
                            aria-required="true" id="emailLogin" placeholder="Email">
                            </input>
                        </div>
                        <div className="col-auto">
                            <input type="password" name="password" id="passwordLogin" required={true} 
                            aria-required="true" className="form-control form-control-sm" placeholder="Password">
                            </input>
                        </div>
                    </div>
                    <div className="mt-3">
                        <button type="submit" className="btn btn-success btn-sm mb-3"> Submit </button>
                    </div>
                </form>
                <style>
                    {`
                        object {
                            height: auto;
                            width: 40vw;
                            position: absolute;
                            top: 25%;
                            left: 75%;
                            transform: translate(-50%, -50%);
                        }

                        h3 {
                            color: white;
                        }

                        label {
                            color: white;
                        }

                        .form-text {
                            color: white;                            
                        }
                    `}
                </style>
        </React.Fragment>
    )
}

ReactDOM.render(<HomePage />, document.querySelector('#create_login'));