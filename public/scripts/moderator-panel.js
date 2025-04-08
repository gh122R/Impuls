getUsersButton = document.getElementById('accordion-2')
function UserInteraction(){
    function getAllUsers () {
        fetch('/getAllUsers', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.users){
                    updateAllUsers(data.users)
                }
            }).catch(error => {
                console.log(error)
        })

        function updateAllUsers(users){
            const usersAccordion = document.querySelector(".users-accordion")
            users.length === 0 ? usersAccordion.innerHTML = 'Пользователей нет. Как это возможно 0_0?' : users.forEach(user => {
                let id = document.createElement("span").innerHTML = user.id
                let fullName = document.createElement("span").innerHTML = user.first_name +  ` ` + user.surname
                let username = document.createElement("span").innerHTML = user.username
                let email = document.createElement("span").innerHTML = user.email
                let aboutUser = document.createElement("div")
                aboutUser.innerHTML = `
                <div class="accordion">
                      <input type="checkbox" id="accordion-${id}" name="accordion-checkbox" hidden>
                      <label class="accordion-header" for="accordion-${id}">
                        <i class="icon icon-arrow-right mr-1"></i>
                        ${fullName}
                      </label>
                      <div class="accordion-body">
                         <p>Логин: ${username}</p>
                         <p>Почта: ${email}</p>
                         <p>Имя: ${user.first_name}</p>
                         <p>Фамилия: ${user.surname}</p>
                      </div>
                </div>                
                `
                aboutUser.classList.add("about-user")
                usersAccordion.append(aboutUser)
            })
        }
    }

   async function deleteUser(){
        try {
            const fetchDel =  await fetch('/deleteUser',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({userId: usrId})
            })
            const data = await fetchDel.json();
            if (data.success){
                console.log('success!')
            }else{
                console.log('error!')
            }
        }catch (error){
            console.log(error)
        }
    }

    async function setUserRole() {
        try {
            const fetchSetRole = await fetch('/setRole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({userId: usrID, role: roleId})
            })
            const data = await  fetchSetRole.json()
            if (data.success){
                console.log('success!')
            }else{
                console.log('error!')
            }
        }catch (error){
            console.log(error)
        }
    }
    getUsersButton.addEventListener("click",  () => {
        document.querySelector('.users-accordion').innerHTML = ''
        getAllUsers()
    })
}

UserInteraction()