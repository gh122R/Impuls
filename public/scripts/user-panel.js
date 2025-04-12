class userInteraction {
    constructor() {
        this.currentComplaints = []
        this.deleteOpen = false;
        this.fetchUserComplaints()
        this.createComplaint()
        setInterval(() => this.fetchUserComplaints(), 1900)
    }

    createComplaint(){
        document.getElementById('complaintForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const form = new FormData(this);
            fetch(this.action, {
                method: 'POST',
                body: form
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const toast = document.createElement("div");
                        toast.innerHTML = "Обращение отправлено";
                        toast.classList.add("toast-success");
                        document.body.appendChild(toast);
                        setTimeout(() => toast.classList.add("show"), 10);


                        setTimeout(() => {
                            toast.classList.remove("show");
                            setTimeout(() => toast.remove(), 900);
                        }, 900);

                        document.getElementById('complaintForm').reset();
                    }
                })
                .catch(toast => {
                    toast.classList.add("toast-error");
                    document.body.appendChild(toast);
                    setTimeout(() => toast.classList.add("show"), 10);

                    setTimeout(() => {
                        toast.classList.remove("show");
                        setTimeout(() => toast.remove(), 900);
                    }, 900);
                });
        });
    }

    fetchUserComplaints() {
        if (this.deleteOpen){
            return
        }
        fetch('/getUserComplaints', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                if (data.complaints) {
                    data.complaints.sort((a, b) => a.id - b.id)
                    if (this.currentComplaints.length === 0 ||
                        JSON.stringify(this.currentComplaints) !== JSON.stringify(data.complaints)) {
                        this.updateComplaintsList(data.complaints)
                    } else {
                        this.updateUnfinishedComplaints(data.complaints)
                    }

                    this.currentComplaints = data.complaints;
                }
            })
            .catch(error => {
                console.error(error)
            });
    }

    updateComplaintsList(complaints) {
        let complaintsContainer = document.querySelector('.complaint-status');
        complaintsContainer.innerHTML = ``;

        if (complaints.length === 0) {
            complaintsContainer.innerHTML = '<p style="color: #fff; text-align: center">У вас пока нет отправленных обращений &#128524;</p>'
            return
        }

        complaints.forEach(complaint => {
            this.createComplaintElement(complaintsContainer, complaint)
        });
    }
    updateUnfinishedComplaints(complaints) {
        complaints.forEach(complaint => {
            if (complaint.status !== 'Выполнено') {
                const existingElement = document.querySelector(`#Tile${complaint.id}`)
                if (existingElement) {
                    const tempContainer = document.createElement('div')
                    this.createComplaintElement(tempContainer, complaint)
                    const newElement = tempContainer.querySelector(`#Tile${complaint.id}`)
                    if (existingElement.innerHTML !== newElement.innerHTML) {
                        existingElement.parentNode.replaceChild(newElement, existingElement)
                    }
                } else {
                    const complaintsContainer = document.querySelector('.complaint-status');
                    this.createComplaintElement(complaintsContainer, complaint)
                }
            }
        })
    }
    createComplaintElement(container, complaint) {
        let complaintElement = document.createElement('div');
        complaintElement.classList.add('tile')
        complaintElement.id = `complaint-${complaint.id}`;
        complaintElement.innerHTML = `
        <div class="tile-content" id="Tile${complaint.id}">
        <div class="tile-header">
             <span class="tile-title">#${complaint.id}</span>
             <span class="tile-subtitle">${complaint.department} | ${complaint.problem_category}</span>
        </div>
            <ul class="step">
                <li class="step-item ${complaint.status === 'В обработке' ? 'active' : ''}">
                    <a href="#" style="${complaint.status === 'В обработке' ? 'color: #fff' : 'color: rgba(255,255,255,0.6)'}" class="tooltip" data-tooltip="В обработке">В обработке</a>
                    <span class="${complaint.status === 'В обработке' ? 'loader' : ''}"></span>
                </li>
                <li class="step-item ${complaint.status === 'В работе' ? 'active' : ''}">
                     <a style="${complaint.status === 'В работе' ? 'color: #fff' : 'color: rgba(255,255,255,0.6)'}" href="#" class="tooltip" data-tooltip="В работе">В работе</a>
                     <progress style="${complaint.status === 'В работе' ? 'width: 70px' : 'display:none'}" class="progress" max="100"></progress>
                </li>
                <li class="step-item ${complaint.status === 'Выполнено' ? 'active' : ''}">
                    <a style="${complaint.status === 'Выполнено' ? 'color: #fff' : 'color: rgba(255,255,255,0.6)'}" href="#" class="tooltip" data-tooltip="Завершено">Завершено</a>
                </li>
            </ul>
            ${complaint.status === 'Выполнено' && complaint.admin_comment != null ? `
            <div class="accordion admin-response-accordion">
                <input type="checkbox" id="accordion-${complaint.id}" name="accordion-checkbox" hidden>
                <label class="accordion-header" for="accordion-${complaint.id}">
                    <i class="icon icon-arrow-right mr-1"></i>
                    Комментарий администратора
                </label>
                <div class="accordion-body">
                    ${complaint.admin_comment || 'Комментарий отсутствует'}
                </div>
            </div>` : ''}
               <div class="delete-container c-hand">
                   <div class="delete-button">
                        <button><i class="icon icon-delete"></i></button>
                   </div>
                   <form class="complaint-form hiddenAdminCompletedComplaint-form" action="/deleteComplaint" data-complaint-id="${complaint.id}">
                   <div class="delete-description" style="text-align: center; margin-bottom: 20px">
                       <p>Вы точно хотите удалить обращение #${complaint.id}?</p>
                    </div>
                    <button id="confirmButton" type="submit" class="btn btn-block btn-error">Да</button>
                   </form>                      
            </div>    
        </div>
    `;
        container.appendChild(complaintElement)
        const deleteButton = complaintElement.querySelector(".delete-button");
        const form = complaintElement.querySelector(".hiddenAdminCompletedComplaint-form");
        const confirmButton = complaintElement.querySelector("#confirmButton");
        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation();
            form.classList.add("show");
            overlay.classList.add("show");
            this.deleteOpen = true;
        });
        overlay.addEventListener("click", () => {
            form.classList.remove("show");
            overlay.classList.remove("show");
            this.deleteOpen = false;
        });
        confirmButton.addEventListener("click", () => {
            form.classList.remove("show");
            overlay.classList.remove("show");
            this.deleteOpen = false;
        });
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const complaintId = form.dataset.complaintId;
            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ complaintId: complaintId })
                });
                const data = await response.json();
                if (data.success) {
                    complaintElement.remove();
                    this.currentComplaints = this.currentComplaints.filter(c => c.id != complaintId);
                } else {
                    alert('Ошибка при удалении обращения #' + complaintId + "😥" + data.id);
                }
            } catch (error) {
                alert("Возникла ошибка при удалении жалобы 😥 " + complaintId + error);
            }
        });
    }
}

new userInteraction()

