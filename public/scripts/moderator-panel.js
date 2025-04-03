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
                    console.log(data.users)
                }
            }).catch(error => {
                console.log(error)
        })

        function updateAllUsers(users){
            const usersAccordion = document.querySelector(".users-accordion")
            users.length === 0 ? usersAccordion.innerHTML = '' : users.forEach(user => {
                let id = document.createElement("div")
                id.innerHTML = user.id
                usersAccordion.append(id)
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
    getAllUsers()
}

UserInteraction()