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
    <div> { taskLists } </div>
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
            <li key={task.id}>{ task.title }</li>
        )
    }

    return (
        <React.Fragment>
            <h2> {props.list.title} </h2>
            <ul> { tasksElements } </ul>
        </React.Fragment>
    )
}

ReactDOM.render(<MainPage />, document.querySelector('#all-lists'));