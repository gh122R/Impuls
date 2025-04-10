class userInteraction{
    constructor() {
        this.getUsersButton = document.getElementById('accordion-2')
        this.init()
    }

     async getAllUsers () {
        fetch('/getAllUsers', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.users){
                    this.updateAllUsers(data.users)
                }
            }).catch(error => {
            console.log(error)
        })
    }

     updateAllUsers(users){
        const usersAccordion = document.querySelector(".users-accordion")
         document.querySelector("#user-count").innerHTML = users.length
        users.length === 0 ? usersAccordion.innerHTML = 'Пользователей нет. Как это возможно 0_0?' :  users.forEach(user => {
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
                        ${fullName} <div class="userInteraction-container" ><button class="btn btn-standart">Изменить роль</button>
                        <button class="btn btn-error delete-button">Удалить</button></div>
                      </label>
                      <div class="accordion-body">
                         <p>Логин: ${username}</p>
                         <p>Почта: ${email}</p>
                         <p>Имя: ${user.first_name}</p>
                         <p>Фамилия: ${user.surname}</p>
                      </div>
                </div>
               <form class="complaint-form hiddenAdminCompletedComplaint-form" action="/hiddenAdminCompletedComplaint" data-complaint-id="${user.id}">
                    <div class="delete-description" style="text-align: center; margin-bottom: 20px">
                       <p>Вы точно хотите удалить пользователя #${user.id}?</p>
                    </div>
                    <button id="confirmButton" type="submit" class="btn btn-block btn-error">Да</button>
              </form>                         
                `
            aboutUser.classList.add("about-user")
            usersAccordion.append(aboutUser)
            const deleteForm = document.querySelector(".complaint-form")
            document.querySelector(".delete-button").addEventListener("click", (event) => {
                event.stopPropagation()
                deleteForm.classList.add("show")
                overlay.classList.add("show")
                overlay.addEventListener("click", () => {
                    deleteForm.classList.remove("show")
                    overlay.classList.remove("show")
                })
            })
            deleteForm.addEventListener("submit",(event) => this.deleteUser(user.id, event))
        })
    }

    async deleteUser(event,userId){
        event.preventDefault()
        try {
            const fetchDel =  await fetch('/deleteUser',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({userId: userId})
            })
            const data = await fetchDel.json();
            if (data.success){
                alert('success')
            }else{
                alert('Произошла ошибка при удалении пользователя!')
            }
        }catch (error){
            alert('Произошла ошибка при удалении пользователя!')
        }
    }

    async setUserRole(UserId, roleId) {
        try {
            const fetchSetRole = await fetch('/setRole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({userId: UserId, role: roleId})
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
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
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
