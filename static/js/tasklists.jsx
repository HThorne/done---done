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

            document.getElementById('authorize_button').innerText = 'Connected. Refresh?';
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


    return (
        <React.Fragment>
            <nav className="navbar bg-body-tertiary sticky-top" >
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">Done & Done</a>
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
                        <button ref={buttonCloseRef} type="button" className="btn-close" 
                        data-bs-dismiss="offcanvas" aria-label="Close">
                        </button>
                    </div>
                    <div className="offcanvas-body">
                        <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
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
                <figure className="text-center">
                    <blockquote className="blockquote">
                        <p id="main-quest-div">
                            Happiness is like those palaces in fairytales whose gates are guarded by dragons: We must fight in order to conquer it.
                        </p>
                    </blockquote>
                    <figcaption id="quote-author" className="blockquote-footer">
                        Alexandre Dumas <cite id="quote-source" title="Source Title"></cite>
                    </figcaption>
                </figure>
                <TaskAccordion taskList={taskList} fetchtasklists={fetchTaskLists}/>
            </div>
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
    )
}


/**
* Create HTML for each task list, each containing respective Task components.
* "Add new task" capability handled here.
*/
function TaskListView(props) {
    const [tasks, setTasks] = React.useState([]);
    const [taskInput, setTaskInput] = React.useState('');
    
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
    }    
    
    // Fetch tasks on load and every change to list.
    React.useEffect(() => {
        fetchTasks()
    }, [props.list]);


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
                        <table className="table table-hover table-borderless align-middle"> 
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
        document.getElementById('main-quest-div').innerHTML = `<strong>Main Quest: ${task.title}</strong>`
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
        // Send task info to server.py, recieve point information to be displayed.
        // let data = await fetch('url', {DATA})
        // data = await data.json()
        // console.log(data)
        fetchTasks();
        // Replace Main Quest with quote if the task there gets marked complete.
        let text = document.getElementById('main-quest-div').innerHTML
        if (text.includes(task.title) && status === 'completed') {
            document.getElementById('main-quest-div').innerHTML = 'The moment you doubt whether you can fly, you cease forever to be able to do it.'
            document.getElementById('quote-author').style.display = "block"
            document.getElementById('quote-author').innerHTML = 'J.M. Barrie <cite id="quote-source" title="Source Title">Peter Pan</cite>'
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
                <div className="btn-group">
                    <button type="button" className="btn btn-secondary dropdown-toggle" 
                    data-bs-toggle="dropdown" aria-expanded="false">
                        Options
                    </button>
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