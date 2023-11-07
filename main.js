var tasks = [];
let lastTaskId = 2;
let taskList;
let addTask;
let loginButton;
let logoutButton;

// kui leht on brauseris laetud siis lisame esimesed taskid lehele
window.addEventListener('load', async () => {
    taskList = document.querySelector('#task-list');
    addTask = document.querySelector('#add-task');
    loginButton = document.querySelector('#login-submit');
    logoutButton = document.querySelector('#logout-submit');
    usernameInput = document.querySelector('#username');
    passwordInput = document.querySelector('#password');
    const registrationForm = document.querySelector('#registration-form');
    const registerButton = document.querySelector('#register-submit');
    const registerUsernameInput = document.querySelector('#register-username');
    const registerPasswordInput = document.querySelector('#register-password');


loginButton.addEventListener('click', async (event) => {
    event.preventDefault();
    login(usernameInput.value, passwordInput.value);

    loginButton.style.display = 'none';
    registrationForm.style.display = 'none';
    
    logoutButton.style.display = 'block';

    loginButton.style.display = 'none';
    registrationForm.style.display = 'none';

    });

logoutButton.addEventListener('click', async (event) => {
    event.preventDefault();
    localStorage.clear();
    loginButton.style.display = 'block';
    registrationForm.style.display = 'block';
});

registerButton.addEventListener('click', (event) => {
    event.preventDefault();
    register(registerUsernameInput.value, registerPasswordInput.value);
    });


    await loadInExistingTasks();

    tasks.forEach(renderTask);
   
    // kui nuppu vajutatakse siis lisatakse uus task
    addTask.addEventListener('click', async () => {
        const task =  await createTask(); // Teeme kõigepealt lokaalsesse "andmebaasi" uue taski
        const taskRow = createTaskRow(task); // Teeme uue taski HTML elementi mille saaks lehe peale listi lisada
        taskList.appendChild(taskRow); // Lisame taski lehele
    });

});
console.log(localStorage.getItem('token'));


async function login(username, password) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
    "username": username,
    "password": password
    });

    var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
    };

    await fetch("https://demo2.z-bit.ee/users/get-token", requestOptions)
    .then(response => response.json())
    .then(result => {
        localStorage.setItem('token', result.access_token);
    })
    .catch(error => console.log('error', error));

}


async function register(username, password) {
    try {
        const response = await fetch("https://demo2.z-bit.ee/users/register", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            alert('Registration successful! You can now log in.');
        } else {
            console.error('Registration failed:', response.statusText);
 
        }
    } catch (error) {
        console.error('Network error:', error);

    }
}



async function loadInExistingTasks(){
    await sendAPIRequest('read', 'tasks', null, null, null, true).then(result => { 
            for (let i = 0; i < result.length; i++) {
                const task = {
                    id: result[i].id,
                    name: result[i].title,
                    completed: result[i].marked_as_done
                };
                tasks.push(task);
            }
        });
}

function renderTask(task) {
    const taskRow = createTaskRow(task);
    taskList.appendChild(taskRow);
}

function createTask() {
    lastTaskId++;
    const task = {
        name: 'Task ' + lastTaskId,
        completed: false
    };
    sendAPIRequest('create', 'tasks', null, task.name);
    return task;
}


function sendAPIRequest(operation, requestPath, taskId, taskTitle, taskIsCompleted, returnFetchResponseResult){

    let URL = `https://demo2.z-bit.ee`;

    if (requestPath != null && taskId != null) {

        URL = [URL, requestPath, taskId].join('/');
        console.log(URL)
    }
    else if (requestPath != null && taskId == null) {
        URL = [URL, requestPath].join('/');
        console.log(URL)
    }

    const result = fetch(URL, createRequestOptions(operation, taskTitle, taskIsCompleted))
    .then(response => response.json())
    .catch(error => console.log('error', error));

    if (returnFetchResponseResult) {
        return result;
    }
}


function createRequestOptions(operation, title, isCompleted) {
    var myHeaders = new Headers();

    myHeaders.append("Authorization", `Bearer ${localStorage.getItem('token')}`);
    console.log(`Bearer ${localStorage.getItem('token')}`)

    switch (operation) {
        case 'create':
            myHeaders.append("Content-Type", "application/json");
            
            var callBody = JSON.stringify({
                "title": title,
                "desc": ""
                });
            
            var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: callBody,
            redirect: 'follow' 
            };

            return requestOptions;
        case 'read':

            var callBody;

            var requestOptions = {
                method: 'GET',
                headers: myHeaders,
                body: callBody,
                redirect: 'follow' 
                };

            return requestOptions;
        case 'update':
            myHeaders.append("Content-Type", "application/json");
            
            var callBody = JSON.stringify({
                "title": title,
                "marked_as_done": isCompleted
                });
            
            var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: callBody,
            redirect: 'follow'
            };

            return requestOptions;
        case 'delete':
            
            var raw;

            var requestOptions = {
                method: 'DELETE',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };
            
            return requestOptions;
        default:
            console.log("ERROR! No matching headers to set found!")
            break;
        
    }
}


function createTaskRow(task) {
    let taskRow = document.querySelector('[data-template="task-row"]').cloneNode(true);
    taskRow.removeAttribute('data-template');

    const name = taskRow.querySelector("[name='name']");
    name.value = task.name;
    name.addEventListener('blur', () => {
        let clickAway;
            sendAPIRequest('update', 'tasks', task.id, name.value);
    });

    const checkbox = taskRow.querySelector("[name='completed']");
    checkbox.checked = task.completed;
    checkbox.addEventListener('click', () => {
        
        sendAPIRequest('update', 'tasks', task.id, name.value, !task.completed);
    });

    const deleteButton = taskRow.querySelector('.delete-task');
    deleteButton.addEventListener('click', async () => {
        taskList.removeChild(taskRow);
        tasks.splice(tasks.indexOf(task), 1);
        await sendAPIRequest('delete', 'tasks', task.id);
    });

    // Valmistame checkboxi ette vajutamiseks
    hydrateAntCheckboxes(taskRow);

    return taskRow;
}


function createAntCheckbox() {
    const checkbox = document.querySelector('[data-template="ant-checkbox"]').cloneNode(true);
    checkbox.removeAttribute('data-template');
    hydrateAntCheckboxes(checkbox);
    return checkbox;
}

/**
 * See funktsioon aitab lisada eridisainiga checkboxile vajalikud event listenerid
 * @param {HTMLElement} element Checkboxi wrapper element või konteiner element mis sisaldab mitut checkboxi
 */
function hydrateAntCheckboxes(element) {
    const elements = element.querySelectorAll('.ant-checkbox-wrapper');
    for (let i = 0; i < elements.length; i++) {
        let wrapper = elements[i];

        // Kui element on juba töödeldud siis jäta vahele
        if (wrapper.__hydrated)
            continue;
        wrapper.__hydrated = true;


        const checkbox = wrapper.querySelector('.ant-checkbox');

        // Kontrollime kas checkbox peaks juba olema checked, see on ainult erikujundusega checkboxi jaoks
        const input = wrapper.querySelector('.ant-checkbox-input');
        if (input.checked) {
            checkbox.classList.add('ant-checkbox-checked');
        }
        
        // Kui checkboxi või label'i peale vajutatakse siis muudetakse checkboxi olekut
        wrapper.addEventListener('click', () => {
            input.checked = !input.checked;
            checkbox.classList.toggle('ant-checkbox-checked');
        });
    }
}