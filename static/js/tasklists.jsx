function MainPage() {
    const [taskList, setTaskList] = React.useState([]);

    async function fetchTaskLists() {
        let response;
        try {
            response = await gapi.client.tasks.tasklists.list({
            'maxResults': 10,
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
      <button id="authorize_button" onClick={ handleAuthClick }>Authorize</button>
      <TaskListView taskList={taskList}/>
    </React.Fragment>
    )
}

function TaskListView(props) {
  const taskLists = []
  
  for (const list of props.taskList) {
    taskLists.push(
        <TasksView list={ list } key={list.id}/>
    )
  }
  
  return (
    <div className="accordion w-100" id="accordionAllLists"> { taskLists } </div>
  )
}



function TasksView(props) {
    const [tasks, setTasks] = React.useState([]);
    
    React.useEffect(() => {
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
        fetchTasks()
    }, [props.list]);



    const tasksElements = []

    for (const task of tasks) {
        tasksElements.push(
            <tr key={task.id}>
              <th scope="row"></th>
              <td><input className="form-check-input" type="checkbox" id="checkboxNoLabel" 
              value="" aria-label="..."></input></td>
              <td>{ task.title }</td>
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