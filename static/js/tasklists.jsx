function MainPage() {
    const [taskList, setTaskList] = React.useState([]);
    const [editListId, setEditListId] = React.useState('');
    const [newName, setNewName] = React.useState('');
    const buttonCloseRef = React.useRef();


    /**
    * Request to get all lists returned in JSON data as an array under items.
    */
    async function fetchTaskLists() {
        let response;
        try {
            response = await gapi.client.tasks.tasklists.list({
            'maxResults': 8,
            });
        } catch (err) {
            document.getElementById('api-errors').innerText = err.message;
            return;
        }
        const taskLists = response.result.items;
        
        setTaskList(taskLists);
    }
    

    /**
    * See oauth.js for functions used here. Get Access token from Google Services 
    */
    function handleAuthClick() {
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                throw (resp);
            }

            document.getElementById('authorize_button').innerText = 'Refresh tasks?';
            document.getElementById('new-tasklist').placeholder='Add new list';
            await fetchTaskLists();
        }
  
  
        if (gapi.client.getToken() === null) {
            // Prompt user to select Google Account and get consent to share their data.
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({prompt: ''});
        }
    }

    async function randomQuest() {
        const incompleteTasks = []
        for (const list of taskList) { 
            let response;
            try {
                response = await gapi.client.tasks.tasks.list({
                    'tasklist': list.id
                });
            } catch (err) {
                document.getElementById('api-errors').innerText = err.message;
                return;
            }
            const tasksResult = response.result.items;

            for (const task of tasksResult) {
                if (task.status === 'needsAction') {
                    incompleteTasks.push(task.title)
                }
            }
        }
        const incompleteData = {
            incomplete: incompleteTasks
        }
        
        let data = await fetch('/random-quest.json', {
                method: 'POST',
                body: JSON.stringify(incompleteData),
                headers: {
                'Content-Type': 'application/json',
            },
        })
        data = await data.json();
        document.getElementById('main-quest-div').innerHTML = `A friendly NPC has handed you a scroll. It reads "${data.task_title}". Do you accept this quest?`
        document.getElementById('quote-author').style.display = "none"
    }

    // Track changes from input and updates the state of the newName variable
    const handleNewName = (event) => {
        setNewName(event.target.value);
    }

    /**
    * Request to update the title of the task to be the newName variable after submit.
    */
    async function editList() {
        let response;
        try {
            response = await gapi.client.tasks.tasklists.update({
                'tasklist': editListId,
                'resource': {
                    'id': editListId,
                    'title': newName
                  }
            });
        } catch (err) {
            document.getElementById('api-errors').innerText = err.message;
            return;
        }

        // Request to prompt page to get updated information and rerender
        fetchTaskLists();
        // Simulate a click to close the offcanvas options menu automatically for user.
        buttonCloseRef.current.click();
    }


    const deleteListButtons = []
    const editListButtons = []

    // Create edit and delete button for each list
    for (const list of taskList) {
        /**
        * Request to delete list with id as parameter. Fetch to get updated info.
        */
        async function deleteList(){
            let response;
            try {
                response = await gapi.client.tasks.tasklists.delete({
                    'tasklist': list.id,
                });
            } catch (err) {
                document.getElementById('api-errors').innerText = err.message;
                return;
            }
            // Request to prompt page to get updated information and rerender
            fetchTaskLists();
        }

        deleteListButtons.push(
            <li key={list.id}>
                <a className="dropdown-item" href="#" data-bs-dismiss="offcanvas" onClick= { deleteList }>
                    { list.title }
                </a>
            </li>
        )

        editListButtons.push(
            <li key={list.id}>
                <a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#editModal" 
                role="button" data-bs-whatever={list} onClick={()=>setEditListId(list.id)}>
                    { list.title }
                </a>
            </li>
        )
    }

    /**
    * Request to change user's RPG class. Fetch to get updated info.
    */
    async function changeClass(newClass) {
        let data = await fetch('/changeclass.json', {
                method: 'POST',
                body: JSON.stringify({newClass: newClass}),
                headers: {
                'Content-Type': 'application/json',
            },
        })
        data = await data.json();

        document.getElementById('points-display').innerText = `LEVEL ${data.level} ${data.rpg_class} 
        \n  ${data.total_score} XP`
    }


    return (
        <React.Fragment>
            <nav className="navbar bg-body-tertiary sticky-top" >
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <img src="/static/img/navbaricon.png" alt="Done and Done Logo"></img>
                    </a>
                    <ul className="navbar-nav me-auto mb-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="#" role="button" id="authorize_button" 
                            onClick={handleAuthClick}>
                                Authorize
                            </a>
                        </li>
                    </ul>
                    <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" 
                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                <div id="options-menu" className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar" 
                aria-labelledby="offcanvasNavbarLabel">
                    <div className="offcanvas-header">
                        <h5 className="offcanvas-title" id="offcanvasNavbarLabel"> Options </h5>
                        <button ref={buttonCloseRef} type="button" className="btn-close mr-20px" 
                        data-bs-dismiss="offcanvas" aria-label="Close">
                        </button>
                    </div>
                    <div className="offcanvas-body">
                        <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                            <li className="nav-item">
                                <a className="nav-link" href="#" data-bs-dismiss="offcanvas" onClick= { randomQuest }>
                                    Random quest
                                </a>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" 
                                data-bs-auto-close="inside" aria-expanded="false">
                                    Rename a List
                                </a>
                                <ul className="dropdown-menu border-0">
                                    {editListButtons}
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" 
                                data-bs-auto-close="inside" aria-expanded="false">
                                    Delete a list
                                </a>
                                <ul className="dropdown-menu border-0">
                                    {deleteListButtons}
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" 
                                data-bs-auto-close="inside" aria-expanded="false">
                                    Change your class
                                </a>
                                <ul className="dropdown-menu border-0">
                                    <li>
                                        <a className="dropdown-item" href="#"  data-bs-dismiss="offcanvas"
                                        onClick={()=>changeClass("Barbarian")}>
                                            Barbarian
                                        </a>
                                        <a className="dropdown-item" href="#"  data-bs-dismiss="offcanvas"
                                        onClick={()=>changeClass("Bard")}>
                                            Bard
                                        </a>
                                        <a className="dropdown-item" href="#"  data-bs-dismiss="offcanvas"
                                        onClick={()=>changeClass("Druid")}>
                                            Druid
                                        </a>
                                        <a className="dropdown-item" href="#"  data-bs-dismiss="offcanvas"
                                        onClick={()=>changeClass("Rogue")}>
                                            Rogue
                                        </a>
                                        <a className="dropdown-item" href="#"  data-bs-dismiss="offcanvas"
                                        onClick={()=>changeClass("Wizard")}>
                                            Wizard
                                        </a>
                                    </li>
                                </ul>
                            </li>                            
                            <li className="nav-item">
                                <a role="button" className="nav-link" data-bs-toggle="modal" data-bs-target="#helpModal">
                                    Help
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/logout" action="/logout" role="button">
                                    Logout
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                </div>
            </nav>
            <div>
                <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header border-0">
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
                                </button>
                            </div>
                            <div className="modal-body border-0">
                                <input type="text" className="form-control" placeholder="Type new name here" 
                                aria-label="Rename list" value={newName} onChange={handleNewName}>
                                </input>
                            </div>
                            <div className="modal-footer border-0">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" 
                                onClick={editList}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal fade" tabIndex="-1" id="helpModal" tabIndex="-1" 
                aria-labelledby="helpModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Welcome adventurers!</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" 
                            aria-label="Close">
                            </button>
                        </div>
                        <div className="modal-body">
                            <p> 
                                Once you connect to one of your Google accounts, you can add tasks to an 
                                existing list or create a new list to add to. As you complete tasks, you'll 
                                gain experience points (XP) and level up. Adding, editing, and deleting lists 
                                and/or tasks will sync with the Google account you chose, but you can use 
                                any Google account to gain XP. Ex. you can switch from your school account 
                                to your personal account and you'll still gain XP! <br></br> 
                                <br></br>
                                <strong>WARNING:</strong><br></br>
                                If you decide to change class, you will lose all your XP and start 
                                at a level 1 in your new class. Old class data is not saved.
                            </p>
                        </div>
                        </div>
                    </div>
                </div>
                <div className="container text-center">
                    <div className="row">
                        <div className="col-md-6"> 
                            <figure className="text-center mt-3">
                                <blockquote className="blockquote">
                                    <p id="main-quest-div">
                                        Happiness is like those palaces in fairytales whose gates are guarded by dragons: We must fight in order to conquer it.
                                    </p>
                                </blockquote>
                                <figcaption id="quote-author" className="blockquote-footer">
                                    Alexandre Dumas <cite id="quote-source" title="Source Title"></cite>
                                </figcaption>
                            </figure>
                            <div class="image-container">
                                <object data="/static/img/sword.svg" type="image/svg+xml"></object>
                            </div> 
                            <div class="card text-bg-light mb-3 col-md-6">
                                <div class="card-body">                               
                                    <blockquote className="blockquote" id="points-display">
                                    </blockquote>
                                </div>
                            </div>
                        </div>
                        <TaskAccordion taskList={taskList} fetchtasklists={fetchTaskLists}/>
                    </div>
                </div>  
            </div>              
            <div id="toast-notif" className="toast-container bottom-0 end-0 p-3">
            </div>
                <style>
                    {`
                        .navbar-brand {
                            height: 50px;
                            padding-top: 0px; 
                            padding-bottom: 0px
                        }
                        
                        .image-container {
                            position: relative;
                            display: block;
                            width: 100%;
                            height: auto;
                          }

                          </style>
                    `}
                </style>
        </React.Fragment>
    )
}


/**
* Create accordion as container for each list as a TaskListView component
* "Add new list" capability handled here to be in accordian.
*/
function TaskAccordion(props) {
    const fetchTaskLists = props.fetchtasklists
    const [taskListInput, setTaskListInput] = React.useState('');
  
    // Track changes from input and updates the state of the taskListInput variable
    const handleInputList = (event) => {
        setTaskListInput(event.target.value);
    };

    // Track keystrokes, look for "Enter". Then add new list and reset taskListInput to empty.
    const handleListEnter = (event) => {
        if (event.key === 'Enter') {
            addTaskList(taskListInput);
            setTaskListInput('');
        }; 
    }

    /**
    * Request to create new list with taskListInput as the title.
    */
    async function addTaskList(title) {
        let response;
        try {
            response = await gapi.client.tasks.tasklists.insert({
                'resource': {
                    'title': `${title}`
                }
            });
        } catch (err) {
            document.getElementById('api-errors').innerText = err.message;
            return;
        }
        // Request to prompt page to get updated information and rerender
        fetchTaskLists();
    }

    const taskLists = []

    // Create TaskListView component for each list
    for (const list of props.taskList) {
        taskLists.push(
            <TaskListView list={list} key={list.id}/>
        )
    }
  
    return (
        <div class="col-md-6">    
            <div className="accordion accordion-flush" id="accordionAllLists">
                { taskLists } 
                <div className="accordion-item">                 
                    <h2 className="accordion-header" id="add_new_list">           
                        <input id="new-tasklist" type="text" className="form-control border-0" 
                        placeholder="Connect to Google Tasks by clicking Authorize" aria-label="Add task list" 
                        value={taskListInput} onChange={handleInputList} onKeyDown={handleListEnter}>
                        </input>
                    </h2>
                </div>
            </div>
        </div>
    )
}


/**
* Create HTML for each task list, each containing respective Task components.
* "Add new task" capability handled here.
*/
function TaskListView(props) {
    const [tasks, setTasks] = React.useState([]);
    const [taskInput, setTaskInput] = React.useState('');
    const [userClass, setUserClass] = React.useState('')
    const [userLevel, setUserLevel] = React.useState(0)
    const [totalScore, setTotalScore] = React.useState(0)
    
    /**
    * Request to get all tasks returned in JSON data as an array under items.
    */
    async function fetchTasks() {
        let response;
        try {
            response = await gapi.client.tasks.tasks.list({
                'tasklist': props.list.id
            });
        } catch (err) {
            document.getElementById('api-errors').innerText = err.message;
            return;
        }
        const tasksResult = response.result.items;
        setTasks(tasksResult);
        
        // Send task info to server.py, recieve point information to be displayed.
        const completedTasks = []
        
        for (const task of tasksResult) {
            if (task.status === 'completed'){
                completedTasks.push(task.id);
            }
        }
        
        const completedData = {
            completed: completedTasks
        }
        
        let data = await fetch('/points.json', {
                method: 'POST',
                body: JSON.stringify(completedData),
                headers: {
                'Content-Type': 'application/json',
            },
        })
        data = await data.json();
        // Set data that is constantly displayed and send other to be in notification.
        setUserClass(data.rpg_class);
        setUserLevel(data.level);     
        setTotalScore(data.total_score);

            
        if (data.new_scores !== []) {
            for (const score of data.new_scores) {
                document.getElementById('toast-notif').insertAdjacentHTML('beforeend', 
                `<div class="toast notification-${data.toast_id}" role="alert" aria-live="polite" aria-atomic="true">
                <div class="toast-header border-0">
                    <strong class="me-auto">Experience gained!</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body border-0">
                    +${score} XP  &  +2 ${data.ability} modifier.
                </div>
            </div>`
                )
            }
            const toastLiveExample = document.querySelectorAll(`.notification-${data.toast_id}`)
            
            for (const toast of toastLiveExample) {
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast)
                toastBootstrap.show()
            }
        }
    }    

    // Fetch tasks on load and every change to list.
    React.useEffect(() => {
        fetchTasks()
    }, []);

    // Update score display with every change to totalScore.
    React.useEffect(() => {
        document.getElementById('points-display').innerText = `LEVEL ${userLevel} ${userClass} 
        \n  ${totalScore} XP`
    }, [totalScore]);

    // Track changes from input and updates the state of the taskInput variable
    const handleInputText = (event) => {
        setTaskInput(event.target.value);
    };
  
    // Track keystrokes, look for "Enter". Then add new task to respective list
    const handleEnter = (event) => {
        if (event.key === 'Enter') {
            addTask(taskInput, "visible");
            setTaskInput('');
        }; 
    }

    /**
    * Request to create new task with title.
    */
    async function addTask(title, visibility) {
        let response;
        try {
            response = await gapi.client.tasks.tasks.insert({
                'tasklist': props.list.id,
                'resource': {
                    'title': `${title}`
                }
            });
        } catch (err) {
            document.getElementById('api-errors').innerText = err.message;
            return;
        }

        // If data should be visible, will fetchTasks for most updated info to be displayed.
        // If not, will return the JSON for the task item, without triggering rerender.
        if (visibility === "visible"){
            fetchTasks();
        } else if (visibility === "hidden") {
           const hiddenTask = response.result;
           return hiddenTask;
        }
    }


    const tasksElements = []

    // Create Task component for each task
    for (const task of tasks) {
        tasksElements.push(
            <Task key={task.id} task={task} list={props.list} fetchtasks={fetchTasks} addtask={addTask}/>
        )
    }

    return (
        <React.Fragment>
            <div className="accordion-item">
                <h2 className="accordion-header" id={props.list.title}>
                    <button className="accordion-button collapsed" type="button" 
                    data-bs-toggle="collapse" data-bs-target={`#${props.list.id}`} aria-expanded="false" 
                    aria-controls={props.list.id}>
                        {props.list.title}
                    </button>
                </h2>
                <div id={props.list.id} className="accordion-collapse show" aria-labelledby={props.list.title}
                  data-bs-parent="#accordionAllLists">
                    <div className="accordion-body">
                        <table className="table table-hover table-borderless align-left"> 
                            <tbody>
                                <tr>
                                    <th scope="row"></th>
                                    <td>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                                        </svg>
                                    </td>
                                    <td colSpan="2">
                                        <input type="text" className="form-control border-0" placeholder="Add a new task" 
                                        aria-label="Add task" value={taskInput} onChange={handleInputText} onKeyDown={handleEnter}>
                                        </input>
                                    </td>
                                </tr>
                             {tasksElements} 
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}


/**
* Create HTML for each task.
* Handle editing, marking complete, or deleting a task.
*/
function Task(props) {
    const [taskEdit, setTaskEdit] = React.useState('');
    const task = props.task;
    const fetchTasks = props.fetchtasks;
    const addTask = props.addtask;

    // Set task title to taskEdit on load and every change to task
    React.useEffect(() => {
        setTaskEdit(task.title);
    }, [task]);

    /**
    * Put indicated task title at the top of the page. 
    * For user to indicate their primary focus to themselves.
    */
    function mainQuest() {
        // Stop task display if task is already complete. 
        if (task.status === 'completed'){
            return  
        }
        document.getElementById('main-quest-div').innerHTML = `<strong>Main Quest:</strong> <br></br>${task.title}`
        document.getElementById('quote-author').style.display = "none"
    }

    /**
    * Request to delete task with id and list id as parameter. Fetch to get updated info.
    */
    async function deleteTask(id) {
        let response;
        try {
            response = await gapi.client.tasks.tasks.delete({
                'tasklist': props.list.id,
                'task': id
            });
        } catch (err) {
            document.getElementById('api-errors').innerText = err.message;
            return;
        }
        // Replace Main Quest with quote if the task there gets deleted.
        let text = document.getElementById('main-quest-div').innerHTML
        if (text.includes(task.title)) {
            randomQuote();
        }
        fetchTasks();
    }

    // Track changes from input and updates the state of the taskEdit variable
    const handleEdit = (event) => {
        setTaskEdit(event.target.value);
    }
        
    // Track keystrokes, look for "Enter". Then send edit task request.
    const handleEditEnter = (event) => {
        if (event.key === 'Enter') {
            editTask(taskEdit);
        }; 
    }

    /**
    * Request to update task with given title.
    */
    async function editTask(title) {
        let response;
        try {
            response = await gapi.client.tasks.tasks.update({
                'tasklist': props.list.id,
                'task': task.id,
                'resource': {
                    'id': task.id,
                    'updated': task.updated,
                    'title': title
                  }
            });
        } catch (err) {
            document.getElementById('api-errors').innerText = err.message;
            return;
        }
        // Add and delete task in background to force return of updated JSON, rather than cached.
        const hidden = await addTask('HIDDEN TASK TO FORCE UPDATED API INFO', 'hidden');
        deleteTask(hidden.id);
        fetchTasks();
    }
    
    /**
    * Request to update task status based on if checkbox is checked.
    */
    async function completeTask(event) {
        let status = 'completed';
            if (!event.target.checked) {
                status = 'needsAction';
            }
        let response;
        try { 
            response = await gapi.client.tasks.tasks.update({
                'tasklist': props.list.id,
                'task': task.id,
                'resource': {
                    'id': task.id,
                    'status': status,
                    'title': task.title
                }
            }); 
        } 
        catch (err) {
            document.getElementById('api-errors').innerText = err.message;
            return;
        }

        fetchTasks();
        // Replace Main Quest with quote if the task there gets marked complete.
        let text = document.getElementById('main-quest-div').innerHTML
        if (text.includes(task.title) && status === 'completed') {
            randomQuote();
        }
    }

    /**
    * Request for a random quote.
    */
    async function randomQuote() {
        let data = await fetch('/quote.json');
  
        data = await data.json();
        console.log(data)

        document.getElementById('main-quest-div').innerHTML = `${data.quote}`;
        document.getElementById('quote-author').style.display = "block";
        if (data.source) {
            document.getElementById('quote-author').innerHTML = `${data.author}   <cite id="quote-source" title="Source Title">${data.source}</cite>`;
        } else {
            document.getElementById('quote-author').innerHTML = `${data.author}`
        }
    }
    
    const style = {};
    const displayAttribute = {};

    // Put line through text if status is 'completed'
    if (task.status === 'completed'){
        style["textDecoration"] = "line-through"  
    }

    // Stop task from editTask from being visible to user.
    if (task.title === 'HIDDEN TASK TO FORCE UPDATED API INFO'){
        displayAttribute["display"] = "none"
    }


    return (
        <tr style={ displayAttribute } list={props.list.id}>
            <th scope="row"></th>
            <td>   
                <input className="form-check-input" type="checkbox" checked={ task.status === 'completed' }
                value="" aria-label="Task complete checkbox" onChange={completeTask} >
                </input>
            </td>
            <td>
                <input className="border-0" type="text" style = {style} value={ taskEdit } 
                onChange={ handleEdit } onKeyDown={handleEditEnter} onBlur={() => editTask(taskEdit)}>
                </input>
            </td>
            <td>
                <div className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" 
                    aria-expanded="false">
                        Options
                    </a>
                    <ul className="dropdown-menu">
                        <li>
                            <button className="dropdown-item" onClick={mainQuest}> 
                                Main Quest 
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item" onClick={ () => deleteTask(task.id) }> 
                                Delete 
                            </button>
                        </li>
                    </ul>
                </div>
            </td>
        </tr>
    )
}
 

ReactDOM.render(<MainPage />, document.querySelector('#all-lists'));