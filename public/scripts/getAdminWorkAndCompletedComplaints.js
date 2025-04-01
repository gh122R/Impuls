const ComplaintsInWork = document.querySelector("#ComplaintsInWork")
const CompletedComplaints = document.querySelector("#CompletedComplaints")
let intervalId = null;

function toast(toastType, toastText){
    const toast = document.createElement("div")
    toast.innerHTML = toastText
    toast.classList.add(toastType)
    document.body.appendChild(toast)
    setTimeout(() => toast.classList.add("show"), 10)
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 900)
    }, 900)
}

startFetching = (fetchFunction) =>  {
    if (intervalId) {
        clearInterval(intervalId);
    }
    fetchFunction();
}

updateComplaints = () => {
    clearInterval(intervalId);
    if (ComplaintsInWork.checked === true) {
        fetchAdminComplaintsInWork()
        toast('toast-success', 'Выбраны все обращения в работе')
    } else if (CompletedComplaints.checked === true) {
        fetchAdminCompletedComplaints()
        ComplaintsInWork.checked = false;
        toast('toast-success', 'Выбраны все завершённые обращения')
    }
}

CompletedComplaints.addEventListener("change", () => {
    ComplaintsInWork.checked = !CompletedComplaints.checked
    updateComplaints()
})

ComplaintsInWork.addEventListener("change", () => {
    CompletedComplaints.checked = !ComplaintsInWork.checked
    updateComplaints();
})

document.addEventListener('DOMContentLoaded', () => {
    ComplaintsInWork.checked = true
    updateComplaints()
})

fetchAdminComplaintsInWork = () => {
    fetch('/getAdminComplaintsInWork', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.complaints) {
                data.complaints.sort((a, b) => a.id - b.id);
                updateAdminWorkComplaintsList(data.complaints, "inWork");
            }
        })
        .catch(error => console.log(error));
}

fetchAdminCompletedComplaints = () => {
    fetch('/getAdminCompletedComplaints', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.complaints) {
                data.complaints.sort((a, b) => a.id - b.id);
                updateAdminCompletedComplaintsList(data.complaints, "completed");
            }
        })
        .catch(error => console.log(error));
}

updateAdminWorkComplaintsList = (complaints, type) => {
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
                            <button class="${ document.body.clientWidth <= 430 ? "btn-block close-complaint-button btn" : "close-complaint-button btn"} " data-complaint-id="${complaint.id}"">Закрыть обращение</button>
                        </div>
                </div>  
            </div>
            <div class="close-complaint">
                <form action="">
                <textarea class="form-input form-textarea" id="comment" name="comment"
                placeholder="Комментарий сотруднику (Можете оставить пустым)" cols="10" rows="4" title=":)"></textarea>
                </form>
                <button id="submitComplete${complaint.id}" class="btn btn-block" type="submit">Отправить</button>
            </div>
        `;
        container.appendChild(complaintDetails);
            const closeComplaintButton = complaintDetails.querySelector(".close-complaint-button")
            const closeComplaintForm = complaintDetails.querySelector(".close-complaint")
            closeComplaintButton.addEventListener("click", (event) => {
                closeComplaintForm.classList.add("show")
                overlay.classList.add("show")
            })
        overlay.addEventListener("click", () => {
            if(closeComplaintForm.classList.contains("show")){
                closeComplaintForm.classList.remove("show")
                overlay.classList.remove("show")
            }
         })
        const CompleteComplaint = async (complaintId, comment) => {
                try{
                    const response = await fetch('/completeComplaint', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify({complaintId: complaintId, comment: comment})
                    })
                    const data = await response.json()
                    if (data.success){
                        const complaintElement = document.querySelector(`#complaintInWork-${complaint.id}`);
                        if (complaintElement){
                            complaintElement.remove()
                        }
                    closeComplaintForm.classList.remove("show");
                    overlay.classList.remove("show");
                    updateComplaints()
                    }else{
                        alert('Ошибка при завершении обращения!')
                    }
                }catch (error){
                    console.log(error)
                }
        }
        document.querySelector("#submitComplete" + complaint.id).addEventListener("click", (event) => {
            event.preventDefault()
            let comment = complaintDetails.querySelector("#comment").value
            if (!comment) {
                comment = null;
            }
            CompleteComplaint(complaint.id, comment)
        });
    });
}

updateAdminCompletedComplaintsList = (complaints, type) => {
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
            <div class="tile completed-tile" id="#complaintInWork-${complaint.id}">
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
                       </div>   ` : ` `}              
                       <div class="delete-container c-hand">
                       <div class="delete-button">
                            <button><i class="icon icon-delete"></i></button>
                       </div>
                       <form class="complaint-form hiddenAdminCompletedComplaint-form" action="/hiddenAdminCompletedComplaint" data-complaint-id="${complaint.id}">
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
        const hiddenAdminCompletedComplaintForm = complaintDetails.querySelector(".hiddenAdminCompletedComplaint-form")
        const form = complaintDetails.querySelector('.hiddenAdminCompletedComplaint-form')
        complaintDetails.querySelector(".delete-button").addEventListener("click", (event) =>{
            event.stopPropagation()
            hiddenAdminCompletedComplaintForm.classList.add("show")
            overlay.classList.add("show")
            overlay.addEventListener("click", () => {
                hiddenAdminCompletedComplaintForm.classList.remove("show")
                overlay.classList.remove("show")
            })
            complaintDetails.querySelector("#confirmButton").addEventListener("click", () => {
                hiddenAdminCompletedComplaintForm.classList.remove("show")
                overlay.classList.remove("show")
            })
        })

        form.addEventListener('submit', async function (event){
            event.preventDefault()
            const complaintId = form.dataset.complaintId
            try{
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ complaintId: complaintId })
                })
                const data = await response.json()
                if (data.success){
                    complaintDetails.remove()
                }else{
                    alert('Ошибка при удалении обращения #' + data.id + "😥")
                }
            }catch (error){
                alert("Возникла ошибка при удалении жалобы 😥")
            }
        })
        container.appendChild(complaintDetails);
    });
}

