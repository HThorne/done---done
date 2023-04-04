function HomePage() {
    const [showCreateAccount, setShowCreateAccount] = React.useState(false);
    const [showLogin, setShowLogin] = React.useState(false);

    const handleClickCreate = () => {
      setShowLogin(false);
      setShowCreateAccount(true);
      
    };

    const handleClickLogin = () => {
        setShowCreateAccount(false);
        setShowLogin(true);
    };

    return (
        <React.Fragment>
            <div class="container text-center">
                <div class="row mb-3 g-3 align-items-center">
                    <object data="/static/img/homepagelogo.svg" type="image/svg+xml"></object>
                </div>
                <div class="row g-3 d-flex align-items-center justify-content-center">
                    <div class="col-auto">
                        <button type="button" className="btn btn-danger btn-sm mb-3" onClick={ handleClickCreate }> CREATE AN ACCOUNT </button>
                    </div>
                    <div class="col-auto">
                        <button type="button" className="btn btn-danger btn-sm mb-3" onClick={ handleClickLogin }> LOGIN </button>
                    </div>
                </div>
                    {showCreateAccount && (
                        <form class="row mb-3 g-3 d-flex justify-content-center" id="create-account" action="/new_user" method="POST">
                                <div className="col-6">
                                    <input type="text" className="form-control form-control-sm" required={true} 
                                    aria-required="true" id="nameInput" placeholder="First Name" name="fname">
                                    </input>
                                </div>
                                <div className="col-6">
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
                                <div className="col-6">
                                    <input type="email" name="email" className="form-control form-control-sm" required={true} 
                                    aria-required="true" id="emailInput" placeholder="Email">
                                    </input>
                                </div>
                                <div className="col-6">
                                    <input type="password" name="password" id="inputPassword" required={true} 
                                    aria-required="true" className="form-control form-control-sm" placeholder="Create Password" aria-labelledby="passwordHelpInline">
                                    </input>
                                    <span id="passwordHelpInline" className="form-text">
                                        Must be 8-20 characters long.
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <button type="submit" className="btn btn-success btn-sm mb-3"> Submit </button>
                                </div>
                        </form>
                    )}
                    {showLogin && (
                        <form id="login" class="row mb-3 g-3 align-items-center d-flex justify-content-center" action="/login" method="POST">
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
                                <div className="col-auto">
                                    <button type="submit" className="btn btn-success btn-sm"> Submit </button>
                                </div>
                        </form>
                    )}
            </div>
                <style>
                    {`
                        object {
                            height: auto;
                            width: 50vw !important;
                            position: relative;
                            top: 50%;
                            left: 15%;
                            // transform: translate(-50%, -50%);
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