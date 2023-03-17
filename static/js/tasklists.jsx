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
      <TaskListView taskList={taskList}/>
      {/* <button type="button" class="btn btn-secondary" id="signout_button" onClick={ handleSignoutClick }>Sign Out</button>  */}
    </React.Fragment>
    )
}

function TaskListView(props) {
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
        props.fetchTaskLists
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

    const [taskEdit, setTaskEdit] = React.useState('');
  
    const handleInputText = (event) => {
      setTaskInput(event.target.value);
    };
  
    const handleEnter = (event) => {
      if (event.key === 'Enter') {
            addTask(taskInput)
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


    async function addTask(title) {
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
        fetchTasks()
    }

    async function editTask(title, id) {
        let response;
        try {
            response = await gapi.client.tasks.tasks.update({
                'tasklist': props.list.id,
                'task': `${ id }`,
                'resource': {
                    'id': `${ id }`,
                    'title': `${ title }`
                  }
            });
        } catch (err) {
            document.getElementById('content').innerText = err.message;
            return;
        }
        
        fetchTasks()
    }

    // const [taskInput, setTaskInput] = React.useState('');
  
    // const pickTask = (event) => {
    //   setTaskInput(event.target.value);
    // };



    const tasksElements = []

    for (const task of tasks) {
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

        const handleInputEdit = (event) => {
            setTaskEdit(event.target.value);
          };
    
        const handleEdit = (event) => {
            if (event.key === 'Enter') {
                  editTask(taskEdit)
          }; }

        async function editTask(title) {
            let response;
            try {
                response = await gapi.client.tasks.tasks.update({
                    'tasklist': props.list.id,
                    'task': task.id,
                    'resource': {
                        'id': task.id,
                        'title': `${ title }`
                      }
                });
            } catch (err) {
                document.getElementById('content').innerText = err.message;
                return;
            }
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

        if (task.status === 'completed'){
            style["text-decoration"] = "line-through"  
        }
        
        tasksElements.push(
            <tr key={task.id} list={props.list.id}>
              <th scope="row"></th>
              <td><input className="form-check-input" type="checkbox" checked={ task.status === 'completed' }
              value="" aria-label="Task complete checkbox" onClick={completeTask}></input></td>
              <td><div id={task.id} style = {style} contentEditable="true" value={taskEdit} onChange={handleInputEdit} onKeyDown={handleEdit}>
                    { task.title }
                  </div>
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

ReactDOM.render(<MainPage />, document.querySelector('#all-lists'));

// onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
//     // setName(event.target.value);}} id="outlined-controlled" value={task.title}