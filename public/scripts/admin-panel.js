class adminInteraction {
    constructor() {
        this.currentPage = 1
        this.pageItems = 3
        this.ComplaintsInWork = document.querySelector("#ComplaintsInWork");
        this.CompletedComplaints = document.querySelector("#CompletedComplaints");
        this.intervalId = null;
        this.overlay = document.querySelector(".overlay");
        this.initEventListeners();
        this.init()
    }

    initEventListeners() {
        this.CompletedComplaints.addEventListener("change", () => {
            this.ComplaintsInWork.checked = !this.CompletedComplaints.checked;
            this.updateComplaints();
        });

        this.ComplaintsInWork.addEventListener("change", () => {
            this.CompletedComplaints.checked = !this.ComplaintsInWork.checked;
            this.updateComplaints();
        });

        document.addEventListener('DOMContentLoaded', () => {
            this.ComplaintsInWork.checked = true;
            this.updateComplaints();
        });
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

    updateComplaints() {
        clearInterval(this.intervalId);
        if (this.ComplaintsInWork.checked === true) {
            this.fetchAdminComplaintsInWork();
            this.toast('toast-success', 'Выбраны все обращения в работе');
        } else if (this.CompletedComplaints.checked === true) {
            this.fetchAdminCompletedComplaints();
            this.ComplaintsInWork.checked = false;
            this.toast('toast-success', 'Выбраны все завершённые обращения');
        }
    }

    fetchAdminComplaintsInWork() {
        fetch('/getAdminComplaintsInWork', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                if (data.complaints) {
                    data.complaints.sort((a, b) => a.id - b.id);
                    this.updateAdminWorkComplaintsList(data.complaints, "inWork");
                }
            })
            .catch(error => console.log(error));
    }

    fetchAdminCompletedComplaints() {
        fetch('/getAdminCompletedComplaints', {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                if (data.complaints) {
                    data.complaints.sort((a, b) => a.id - b.id);
                    this.updateAdminCompletedComplaintsList(data.complaints, "completed");
                }
            })
            .catch(error => console.log(error));
    }

    updateAdminWorkComplaintsList(complaints, type) {
        const container = document.querySelector(".complaint-list");
        if (!container) return;
        container.innerHTML = '';
        if (complaints.length === 0) {
            container.innerHTML = `<p style="color: #fff; text-align: center">
                ${type === "inWork" ? "Вы пока не приняли ни одного обращения" : "Нет завершенных обращений"}
            </p>`;
            return;
        }

        complaints.forEach(complaint => {
            const complaintDetails = document.createElement("div");
            complaintDetails.classList.add('complaint-details');
            complaintDetails.innerHTML = `
                <div class="tile" id="complaintInWork-${complaint.id}">
                    <div class="tile-content">
                        <div class="tile-title">Обращение #${complaint.id} от ${complaint.first_name} ${complaint.surname}</div>
                        <div class="tile-subtitle">Отдел: ${complaint.department}</div>
                        <div class="tile-category">Категория: ${complaint.problem_category}</div>
                        <div class="tile-status">
                            ${type === "inWork"
                ? `Дата приёма обращения в работу: ${complaint.updated_at}`
                : `Дата завершения: ${complaint.updated_at || 'Не указана'}`} 
                        </div>
                        <div class="accordion">
                            <input type="checkbox" id="accordion-${complaint.id}" name="accordion-checkbox" hidden>
                            <label class="accordion-header" for="accordion-${complaint.id}">
                                <i class="icon icon-arrow-right mr-1"></i>
                                Комментарий сотрудника
                            </label>
                            <div class="accordion-body">
                                ${complaint.description}
                            </div>
                        </div>
                        <div class="complaint-footer" style="display: flex; justify-content: right">
                            <button class="${document.body.clientWidth <= 430 ? "btn-block close-complaint-button btn" : "close-complaint-button btn"}" 
                                    data-complaint-id="${complaint.id}">
                                Закрыть обращение
                            </button>
                        </div>
                    </div>  
                </div>
                <div class="close-complaint">
                    <form action="">
                        <textarea class="form-input form-textarea" id="comment" name="comment"
                            placeholder="Комментарий сотруднику (Можете оставить пустым)" 
                            cols="10" rows="4" title=":)"></textarea>
                    </form>
                    <button id="submitComplete${complaint.id}" class="btn btn-block" type="submit">Отправить</button>
                </div>
            `;

            container.appendChild(complaintDetails);
            this.setupComplaintEventHandlers(complaintDetails, complaint);
        });
    }

    setupComplaintEventHandlers(complaintDetails, complaint) {
        const closeComplaintButton = complaintDetails.querySelector(".close-complaint-button");
        const closeComplaintForm = complaintDetails.querySelector(".close-complaint");

        closeComplaintButton.addEventListener("click", (event) => {
            event.stopPropagation()
            closeComplaintForm.classList.add("show");
            this.overlay.classList.add("show");
        });

        this.overlay.addEventListener("click", () => {
            if (closeComplaintForm.classList.contains("show")) {
                closeComplaintForm.classList.remove("show");
                this.overlay.classList.remove("show");
            }
        });

        document.querySelector(`#submitComplete${complaint.id}`).addEventListener("click", (event) => {
            event.preventDefault();
            let comment = complaintDetails.querySelector("#comment").value;
            if (!comment) {
                comment = null;
            }
            this.completeComplaint(complaint.id, comment, complaintDetails);
        });
    }

    completeComplaint(complaintId, comment, complaintElement) {
        fetch('/completeComplaint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({complaintId: complaintId, comment: comment})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    complaintElement.remove();
                    this.overlay.classList.remove("show")
                    this.updateComplaints();
                } else {
                    alert('Ошибка при завершении обращения!');
                }
            })
            .catch(error => console.log(error));
    }

    updateAdminCompletedComplaintsList(complaints, type) {
        const container = document.querySelector(".complaint-list");
        if (!container) return;

        container.innerHTML = '';

        if (complaints.length === 0) {
            container.innerHTML = `<p style="color: #fff; text-align: center">
                ${type === "inWork" ? "Вы пока не приняли ни одного обращения" : "Нет завершенных обращений"}
            </p>`;
            return;
        }

        complaints.forEach(complaint => {
            const complaintDetails = document.createElement("div");
            complaintDetails.classList.add('complaint-details');
            complaintDetails.innerHTML = `
                <div class="tile completed-tile" id="complaintInWork-${complaint.id}">
                    <div class="tile-content">
                        <div class="tile-title">Обращение #${complaint.id} от ${complaint.first_name} ${complaint.surname}</div>
                        <div class="tile-subtitle">Отдел: ${complaint.department}</div>
                        <div class="tile-category">Категория: ${complaint.problem_category}</div>
                        <div class="tile-status">
                            ${type === "inWork"
                ? `Дата приёма обращения в работу: ${complaint.updated_at}`
                : `Дата завершения: ${complaint.updated_at || 'Не указана'}`} 
                        </div>
                        <div class="accordion completed-accordion">
                            <input type="checkbox" id="accordion-${complaint.id}" name="accordion-checkbox" hidden>
                            <label class="accordion-header" for="accordion-${complaint.id}">
                                <i class="icon icon-arrow-right mr-1"></i>
                                Комментарий сотрудника
                            </label>
                            <div class="accordion-body">
                                ${complaint.description}
                            </div>
                        </div>                  
                        ${complaint.admin_comment != null ? `
                            <div class="accordion completed-accordion">
                                <input type="checkbox" id="accordion-${complaint.id+1}" name="accordion-checkbox" hidden>
                                <label class="accordion-header" for="accordion-${complaint.id+1}">
                                    <i class="icon icon-arrow-right mr-1"></i>
                                    Ваш ответ
                                </label>
                                <div class="accordion-body">
                                    ${complaint.admin_comment}
                                </div>
                            </div>` : ``}              
                        <div class="delete-container c-hand">
                            <div class="delete-button">
                                <button><i class="icon icon-delete"></i></button>
                            </div>
                            <form class="complaint-form hiddenAdminCompletedComplaint-form" 
                                  action="/hiddenAdminCompletedComplaint" 
                                  data-complaint-id="${complaint.id}">
                                <div class="delete-description" style="text-align: center; margin-bottom: 20px">
                                    <p>Вы точно хотите удалить обращение #${complaint.id}?</p>
                                    <p>Оно удалится только у вас</p>
                                </div>
                                <button id="confirmButton" type="submit" class="btn btn-block btn-error">Да</button>
                            </form>                      
                        </div>                       
                    </div>  
                </div>
            `;

            this.setupCompletedComplaintEventHandlers(complaintDetails, complaint);
            container.appendChild(complaintDetails);
        });
    }

    setupCompletedComplaintEventHandlers(complaintDetails) {
        const hiddenAdminCompletedComplaintForm = complaintDetails.querySelector(".hiddenAdminCompletedComplaint-form");
        const form = complaintDetails.querySelector('.hiddenAdminCompletedComplaint-form');

        complaintDetails.querySelector(".delete-button").addEventListener("click", (event) => {
            event.stopPropagation();
            hiddenAdminCompletedComplaintForm.classList.add("show");
            this.overlay.classList.add("show");
        });

        this.overlay.addEventListener("click", () => {
            hiddenAdminCompletedComplaintForm.classList.remove("show");
            this.overlay.classList.remove("show");
        });

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const complaintId = form.dataset.complaintId;
            this.hideCompletedComplaint(complaintId, complaintDetails);
        });
    }

    hideCompletedComplaint(complaintId, complaintDetails) {
        fetch('/hiddenAdminCompletedComplaint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ complaintId: complaintId })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    complaintDetails.remove();
                    this.overlay.classList.remove("show")
                } else {
                    alert('Ошибка при удалении обращения #' + data.id + "😥");
                }
            })
            .catch(() => {
                alert("Возникла ошибка при удалении жалобы 😥");
            });
    }

    fetchAdminProcessingComplaints  () {
        fetch('/getAllProcessingComplaints', {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data =>{
                if (data.complaints){
                    data.complaints.sort((a,b)=> a.id - b.id)
                    this.updateComplaintsList(data.complaints)
                    this.updatePaginationControls(data.complaints.length)
                }
            }).catch(error => {
            console.log(error)
        })
    }

    updateComplaintsList (complaints) {
        const adminMain = document.querySelector(".admin-main-container")
        adminMain.innerHTML = ''

        if (complaints.length === 0) {
            adminMain.innerHTML = '<p style="color: #fff; text-align: center">Список обращений пуст</p><div class="loading loading-lg"></div>'
            return
        }

        const startIndex = (this.currentPage - 1) * this.pageItems
        const endIndex = startIndex + this.pageItems
        const paginationItems = complaints.slice(startIndex, endIndex)

        paginationItems.forEach(complaint => {
            const complaintDetails = document.createElement("div")
            complaintDetails.classList.add('complaint-details')
            complaintDetails.id = `complaint-${complaint.id}`
            complaintDetails.innerHTML = `
            <div class="tile">
                <div class="tile-content">
                    <div class="tile-title">Обращение #${complaint.id} от ${complaint.first_name} ${complaint.surname}</div>
                    <div class="tile-subtitle">Отдел: <span style="text-transform: lowercase">${complaint.department}</span></div>
                    <div class="tile-status">Категория: <span style="text-transform: lowercase">${complaint.problem_category}</span></div>
                     <div class="tile-action">
                            <div class="created_at">
                               <span>${complaint.created_at}</span>
                           </div>
                        <button type="submit" class=" ${document.body.clientWidth <= 430 ? "btn-block btn takeInWork" : "takeInWork btn" } ">Взять в работу</button>
                     </div>
                </div>
            </div>
        `;
            adminMain.appendChild(complaintDetails)
        });
    };

     updatePaginationControls(totalItems){
        const paginationContainer = document.querySelector(".pagination-container")
        if (!paginationContainer) return

        paginationContainer.innerHTML = ''

        const totalPages = Math.ceil(totalItems / this.pageItems)
        if (totalPages <= 1) return
        const prevButton = document.createElement("button")
        prevButton.className = "btn btn-action"
        prevButton.innerHTML = '<i class="icon icon-arrow-left"></i>'
        prevButton.disabled = this.currentPage === 1
        prevButton.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--
                this.fetchAdminProcessingComplaints()
            }
        })

        const nextButton = document.createElement("button")
        nextButton.className = "btn btn-action"
        nextButton.innerHTML = '<i class="icon icon-arrow-right"></i>'
        nextButton.disabled = this.currentPage === totalPages
        nextButton.addEventListener('click', () => {
            if (this.currentPage < totalPages) {
                this.currentPage++
                this.fetchAdminProcessingComplaints()
            }
        })

        const pageInfo = document.createElement("span")
        pageInfo.className = "pagination-info"
        pageInfo.textContent = `${this.currentPage} / ${totalPages}`
        paginationContainer.appendChild(prevButton)
        paginationContainer.appendChild(pageInfo)
        paginationContainer.appendChild(nextButton)
    }

      async takeComplaint(complaintId) {
        try {
            const response = await fetch('/takeComplaint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ complaintId })
            })
            const data = await response.json();
            if (data.success) {
                let adminMain = document.querySelector('.admin-main')
                let complaintId = adminMain.querySelector('.tile-title').textContent.match(/\d+/)[0];
                this.toast('toast-success', 'Вы взяли в работу обращение #' + complaintId + '!')
                const complaintElement = document.querySelector(`#complaint-${complaintId}`)
                this.fetchAdminComplaintsInWork()
                if (complaintElement) {
                    complaintElement.remove()
                }
            } else {
                alert('Ошибка при взятии обращения!')
            }
        } catch (error) {
            console.error('Ошибка при взятии жалобы:', error)
        }
    }

    init () {
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('takeInWork') && event.target.textContent === 'Взять в работу') {
                const complaintId = event.target.closest('.tile').querySelector('.tile-title').textContent.match(/\d+/)[0];
                this.takeComplaint(complaintId);
            }
        })
        setInterval(() => this.fetchAdminProcessingComplaints(), 2000)
        this.fetchAdminProcessingComplaints()
        this.fetchAdminComplaintsInWork()
    }

}

new adminInteraction()