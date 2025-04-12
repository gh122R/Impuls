class userInteraction{
    constructor() {
        this.getUsersButton = document.getElementById('accordion-2')
        this.init()
    }

    toast(toastType, toastText) {
        const toast = document.createElement("div");
        toast.innerHTML = toastText;
        toast.classList.add(toastType);
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add("show"), 10);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 900);
        }, 900);
    }

     async getAllUsers () {
        fetch('/getAllUsers', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                if (data.users){
                    this.getRoles().then(roles => {
                        this.updateAllUsers(data.users, roles)
                    })
                }
            }).catch(error => {
            console.log(error)
        })
    }

    async getRoles() {
        return fetch('/getRoles', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.roles)
                return data.roles
            }).catch(error => {
                console.log(error)
        })
    }

     updateAllUsers(users, roles){
        const usersAccordion = document.querySelector(".users-accordion")
         usersAccordion.innerHTML = '';
         document.querySelector("#user-count").innerHTML = users.length
        users.length === 0 ? usersAccordion.innerHTML = 'Пользователей нет. Как это возможно 0_0?' :  users.forEach(user => {
            let aboutUser = document.createElement("div")
            aboutUser.innerHTML = `
                <div class="accordion">
                      <input type="checkbox" id="accordion-${user.id}+4" name="accordion-checkbox" hidden>
                      <label class="accordion-header" for="accordion-${user.id}+4">
                        <i class="icon icon-arrow-right mr-1"></i>
                        ${user.first_name} ${user.surname} <span class="user-role" >${user.role}</span>
                      </label>
                      <div class="accordion-body user-body">
                         <p>Логин: <span class="user-body__element">${user.username}</span></p>
                         <p>Почта: <span class="user-body__element">${user.email}</span></p>
                         <p>Имя: <span class="user-body__element">${user.first_name}</span></p>
                         <p>Фамилия: <span class="user-body__element">${user.surname}</span></p>
                         <div class="userInteraction-container" >
                             <button class="btn btn-standart role-button" >Изменить роль</button>
                            <button class="btn btn-error delete-button">Удалить</button>
                        </div>
                      </div>
                        <form class="user-form hidden-delete-user-form"  data-user-id="${user.id}">
                            <div class="delete-description" style="text-align: center; margin-bottom: 20px">
                               <p>Вы точно хотите удалить пользователя #${user.id}?</p>
                            </div>
                            <button id="confirmButton" type="submit" class="btn btn-block btn-error">Да</button>
                      </form>
                      <form class="user-form hidden-user-role-form"  data-user-id="${user.id}">
                            <div class="delete-description" style="text-align: center; margin-bottom: 20px">
                               <p>Выберите роль пользователю #${user.id}</p>
                            </div>
                            <div class="form-group">
                                <select class="form-select form-in" id="role-id" name="roleId" required>
                                ${roles.map(role => `<option class="role-option" value="${role.id}">${role.role}</option>`).join('')}
                                </select>
                             </div>
                            <button id="confirmButton" type="submit" class="btn btn-block btn-error">Изменить роль</button>
                      </form>
                </div>                     
                `
            aboutUser.classList.add("about-user")
            usersAccordion.append(aboutUser)
            const roleForm = aboutUser.querySelector(".hidden-user-role-form")
            const deleteForm = aboutUser.querySelector(".hidden-delete-user-form")
            aboutUser.querySelector(".delete-button").addEventListener("click", (event) => {
                event.stopPropagation()
                deleteForm.classList.add("show")
                overlay.classList.add("show")
                overlay.addEventListener("click", () => {
                    deleteForm.classList.remove("show")
                    overlay.classList.remove("show")
                })
            })
            deleteForm.addEventListener("submit",(event) => {
                this.deleteUser(event,user.id, deleteForm)
            })
            aboutUser.querySelector(".role-button").addEventListener("click", (event) => {
                event.stopPropagation()
                roleForm.classList.add("show")
                overlay.classList.add("show")
                overlay.addEventListener("click", () => {
                    roleForm.classList.remove("show")
                    overlay.classList.remove("show")
                })
                    roleForm.addEventListener("submit", (event) => {
                        let roleId = roleForm.querySelector("#role-id").value;
                        this.setUserRole(event, roleForm, user.id, roleId)
                    })
            })
        })
    }

    async deleteUser(event,userId, deleteForm){
        event.preventDefault()
        try {
            const fetchDel =  await fetch('/deleteUser',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userId: userId, password: 'none'})
            })
            const data = await fetchDel.json();
            if (data.success)
            {
                this.toast('toast-success', 'Вы удалили пользователя #' + userId)
                overlay.classList.remove("show")
                deleteForm.classList.remove("show")
                document.querySelector('.users-accordion').innerHTML = ''
                this.getAllUsers()
            }else{
                this.toast('toast-error', 'Ошибка при удалении пользователя #' + userId)
            }
        }catch (error){
            alert('Произошла ошибка при удалении пользователя!')
        }
    }

    async setUserRole(event, roleForm,  userId, roleId) {
        event.preventDefault()
        try {
            const fetchSetRole = await fetch('/setRole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userId: userId, role: roleId})
            })
            const data = await fetchSetRole.json()
            if (data.success){
                overlay.classList.remove("show")
                roleForm.classList.remove("show")
                document.querySelector('.users-accordion').innerHTML = ''
                this.getAllUsers()
                console.log('success!')
            }else{
                console.log('error!')
            }
        }catch (error){
            alert( roleId)
        }
    }

    init(){
        this.getUsersButton.addEventListener("click",  () => {
            document.querySelector('.users-accordion').innerHTML = ''
            this.getAllUsers()
        })
    }
}

class complaintInteraction{

    constructor() {
        this.getComplaintsButton = document.getElementById('accordion-1')
        this.init()
    }
    async getAllComplaints(){
        fetch('/getAllComplaints', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                if(data.complaints){
                    this.updateComplaints(data.complaints)
                }
            }).catch(error  => {
                console.log(error)
        })
    }

    updateComplaints(complaints) {
        const usersAccordion = document.querySelector(".complaints-accordion")
        complaints.length !== 0 ? document.querySelector("#complaint-count").innerHTML = complaints.length : 0
            complaints.length === 0 ? usersAccordion.innerHTML = 'Обращений нет.' : complaints.forEach(complaint => {
            let id = document.createElement("span").innerHTML = complaint.id + 1
            let fullName = document.createElement("span").innerHTML = complaint.first_name +  ` ` + complaint.surname
            let aboutComplaint = document.createElement("div")
            aboutComplaint.innerHTML = `
                <div class="accordion">
                      <input type="checkbox" id="accordion-${id}" name="accordion-checkbox" hidden>
                      <label class="accordion-header" for="accordion-${id}">
                        <i class="icon icon-arrow-right mr-1"></i>
                        #${id-1} ${complaint.problem_category} | ${complaint.department} 
                        <span class="status-container">
                        <span class="status-complaint ${complaint.status === 'В обработке' ? "processing"
                                                                        : complaint.status === 'В работе' ? "in-work" : "finished"}">
                                                                        ${complaint.status}</span></span>
                      </label>
                      <div class="accordion-body">
                         <p>Отправитель: ${fullName}</p>       
                         <div class="accordion accordion-comment">
                              <input type="checkbox" id="accordion-complaint-description-${id}" name="accordion-checkbox" hidden>
                              <label class="accordion-header" for="accordion-complaint-description-${id}">
                                <i class="icon icon-arrow-right mr-1"></i>
                                Комментариий пользователя
                              </label>
                              <div class="accordion-body accordion-body-comment">
                              <blockquote>
                              <p>${complaint.description} </p>
                              <cite>- ${fullName}</cite>
                            </blockquote>
                              </div>
                        </div>    
                        ${complaint.admin_comment ? `
                        <div class="accordion accordion-comment">
                              <input type="checkbox" id="accordion-complaint-admin-comment-${id}" name="accordion-checkbox" hidden>
                              <label class="accordion-header" for="accordion-complaint-admin-comment-${id}">
                                <i class="icon icon-arrow-right mr-1"></i>
                                Комментариий администратора
                              </label>
                              <div class="accordion-body accordion-body-comment">
                             <blockquote>
                              <p>${complaint.admin_comment}</p>
                              <cite>- ${complaint.admin_name}</cite>
                            </blockquote>
                              </div>
                        </div>
                        ` : ``}
                         <p class="created_at"><span>Дата отправки: ${complaint.created_at}</span></p>
                      </div>
                </div>                
                `
            aboutComplaint.classList.add("about-user")
            usersAccordion.append(aboutComplaint)
        })
    }

    init(){
        this.getComplaintsButton.addEventListener("click",  () => {
            document.querySelector('.complaints-accordion').innerHTML = ''
            this.getAllComplaints()
        })
    }
}
new complaintInteraction()
new userInteraction();
