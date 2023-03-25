function HomePage() {


    return (
        <React.Fragment>
            <h2>Create an Account</h2>
    
            <form action="/new_user" method="POST">
            <p> 
                First Name <input type="text" name="fname" required={true} aria-required="true"></input>
            </p>
            <p> 
                Email <input type="text" name="email" required={true} aria-required="true"></input>
            </p>
            <p> 
                Password <input type="password" name="password" required={true} aria-required="true"></input>
            </p>
            <p>
                <input type="submit"></input>
            </p>
            </form>
        
            <h2>Log In</h2>
        
            <form action="/login" method="POST">
            <p> 
                Email <input type="text" name="email"></input>
            </p>
            <p> 
                Password <input type="password" name="password"></input>
            </p>
            <p>
                <input type="submit"></input>
            </p>
            </form>
        </React.Fragment>
    )
}

ReactDOM.render(<HomePage />, document.querySelector('#create_login'));