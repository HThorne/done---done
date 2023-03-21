function MainPage() {
    const [taskList, setTaskList] = React.useState([]);

    async function fetchTaskLists() {
        let response;
        try {
            response = await gapi.client.tasks.tasklists.list({
            'maxResults': 8,
            });
        } catch (err) {
            document.getElementById('content').innerText = err.message;
            return;
        }
        const taskLists = response.result.items;
        
        setTaskList(taskLists)
    }
    

    function handleAuthClick() {
        tokenClient.callback = async (resp) => {
          if (resp.error !== undefined) {
            throw (resp);
          }
          document.getElementById('authorize_button').innerText = 'Connected. Refresh?';
          await fetchTaskLists();
          };
  
  
        if (gapi.client.getToken() === null) {
          // Prompt the user to select a Google Account and ask for consent to share their data
          // when establishing a new session.
          tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
          // Skip display of account chooser and consent dialog for an existing session.
          tokenClient.requestAccessToken({prompt: ''});
        }
      }
    
    return (
    <React.Fragment>
      <button type="button" className="btn btn-secondary" id="authorize_button" onClick={ handleAuthClick }>Authorize</button>
      <TaskListView taskList={taskList} fetchtasklists={ fetchTaskLists }/>
      {/* <button type="button" class="btn btn-secondary" id="signout_button" onClick={ handleSignoutClick }>Sign Out</button>  */}
    </React.Fragment>
    )
}

function TaskListView(props) {
    const fetchTaskLists = props.fetchtasklists
    const [taskListInput, setTaskListInput] = React.useState('');
  
    const handleInputList = (event) => {
      setTaskListInput(event.target.value);
    };

    const handleListEnter = (event) => {
        if (event.key === 'Enter') {
              addTaskList(taskListInput)
              setTaskListInput('')
      }; }

    async function addTaskList(title) {
        let response;
        try {
            response = await gapi.client.tasks.tasklists.insert({
                'resource': {
                    'title': `${ title }`
                    }
            });
        } catch (err) {
            document.getElementById('content').innerText = err.message;
            return;
        }
        fetchTaskLists()
    }

    const taskLists = []

    for (const list of props.taskList) {
        taskLists.push(
            <TasksView list={ list } key={list.id}/>
        )
    }
  
  return (
    <div className="accordion" id="accordionAllLists">
        { taskLists } 
        <div className="accordion-item">                 
        <h2 className="accordion-header" id="add_new_list">           
                <input type="text" className="form-control border-0" placeholder="Add a new list" 
                aria-label="Add task list" value={taskListInput} onChange={handleInputList} onKeyDown={handleListEnter}>
                </input>
        </h2>
        </div>
    </div>
  )
}



function TasksView(props) {
    const [tasks, setTasks] = React.useState([]);

    const [taskInput, setTaskInput] = React.useState('');
  
    const handleInputText = (event) => {
      setTaskInput(event.target.value);
    };
  
    const handleEnter = (event) => {
      if (event.key === 'Enter') {
            addTask(taskInput, "visible")
            setTaskInput('')
    }; }
    

    async function fetchTasks() {
        let response;
        try {
            response = await gapi.client.tasks.tasks.list({
                'tasklist': props.list.id
            });
        } catch (err) {
            document.getElementById('content').innerText = err.message;
            return;
        }
        const tasksResult = response.result.items;
        setTasks(tasksResult)
    }

    React.useEffect(() => {
        fetchTasks()
    }, [props.list]);


    async function addTask(title, visibility) {
        let response;
        try {
            response = await gapi.client.tasks.tasks.insert({
                'tasklist': props.list.id,
                'resource': {
                    'title': `${ title }`
                  }
            });
        } catch (err) {
            document.getElementById('content').innerText = err.message;
            return;
        }
        if (visibility === "visible"){
            fetchTasks()
        } else if (visibility === "hidden") {
           const hiddenTask = response.result
           return hiddenTask
        }
    }


    const tasksElements = []

    for (const task of tasks) {
        tasksElements.push(
            <Task key={task.id} task={task} list={props.list} fetchtasks={ fetchTasks } addtask={addTask}/>
        )
    }

    return (
        <React.Fragment>
            <div className="accordion-item">
                <h2 className="accordion-header" id={props.list.title}>
                    <button className="accordion-button collapsed" type="button" 
                    data-bs-toggle="collapse" data-bs-target={`#${props.list.id}`} aria-expanded="true" aria-controls={props.list.id}>
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
                                    <td><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                                        </svg>
                                    </td>
                                    <td colSpan="2"><input type="text" className="form-control border-0" placeholder="Add a new task" aria-label="Add task" value={taskInput}
                                                    onChange={handleInputText}
                                                    onKeyDown={handleEnter}>
                                        </input>
                                    </td>
                            </tr>
                            { tasksElements } 
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}


function Task(props) {
    const [taskEdit, setTaskEdit] = React.useState('');
    const task = props.task
    const fetchTasks = props.fetchtasks
    const addTask = props.addtask

    React.useEffect(() => {
        setTaskEdit(task.title)
    }, [task]);

    async function deleteTask() {
        let response;
        try {
            response = await gapi.client.tasks.tasks.delete({
                'tasklist': props.list.id,
                'task': task.id
            });
        } catch (err) {
            document.getElementById('content').innerText = err.message;
            return;
        }
        fetchTasks()
    }

    async function deleteHiddenTask(id) {
        let response;
        try {
            response = await gapi.client.tasks.tasks.delete({
                'tasklist': props.list.id,
                'task': id
            });
        } catch (err) {
            document.getElementById('content').innerText = err.message;
            return;
        }
        fetchTasks()
    }

    const handleEdit = (event) => {
        setTaskEdit(event.target.value)
    }
        
    const handleEditEnter = (event) => {
        if (event.key === 'Enter') {
            editTask(taskEdit)
      }; 
    }

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
            document.getElementById('content').innerText = err.message;
            return;
        }
        const hidden = await addTask('HIDDEN TASK TO FORCE UPDATED API INFO', 'hidden')
        deleteHiddenTask(hidden.id)
        fetchTasks()
    }
    

    async function completeTask(event) {
        let response;
        try { 
            let status = 'completed'
            if (!event.target.checked) {
                status = 'needsAction';
            }
            
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
            document.getElementById('content').innerText = err.message;
            return;
        }

        fetchTasks()
    }

    const style = {}
    const displayAttribute = {}

    if (task.status === 'completed'){
        style["textDecoration"] = "line-through"  
    }

    if (task.title === 'HIDDEN TASK TO FORCE UPDATED API INFO'){
        displayAttribute["display"] = "none"
    }

    // <div id={task.id} style = {style} contentEditable="true" onKeyDown={handleEdit}>
    //           { taskEdit }
    //         </div>

    return (
        <tr style={ displayAttribute } list={props.list.id}>
        <th scope="row"></th>
        <td><input className="form-check-input" type="checkbox" checked={ task.status === 'completed' }
        value="" aria-label="Task complete checkbox" onChange={completeTask} ></input></td>
        <td><input className="border-0" type="text" style = {style} value={ taskEdit } onChange={ handleEdit } onKeyDown={handleEditEnter} 
            onBlur={() => editTask(taskEdit)}></input>
        </td>
          <td>
          <div className="btn-group">
              <button type="button" className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                  Options
              </button>
              <ul className="dropdown-menu">
                  {/* <li><button className="dropdown-item" taskId={task.id} onClick={ editTask }>Edit</button></li> */}
                  <li><button className="dropdown-item" onClick={ deleteTask }>Delete</button></li>
              </ul>
          </div>
          </td>
      </tr>
    )
}

ReactDOM.render(<MainPage />, document.querySelector('#all-lists'));