let currentPage = 1
const pageItems = 3

fetchAdminProcessingComplaints = () => {
    fetch('/getAllProcessingComplaints', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data =>{
            if (data.complaints){
                data.complaints.sort((a,b)=> a.id - b.id)
                updateComplaintsList(data.complaints)
                updatePaginationControls(data.complaints.length)
            }
        }).catch(error => {
            console.log(error)
    })
}

const updateComplaintsList = (complaints) => {
    const adminMain = document.querySelector(".admin-main-container")
    adminMain.innerHTML = ''

    if (complaints.length === 0) {
        adminMain.innerHTML = '<p style="color: #fff; text-align: center">Список обращений пуст</p><div class="loading loading-lg"></div>'
        return
    }

    const startIndex = (currentPage - 1) * pageItems
    const endIndex = startIndex + pageItems
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

const updatePaginationControls = (totalItems) => {
    const paginationContainer = document.querySelector(".pagination-container")
    if (!paginationContainer) return

    paginationContainer.innerHTML = ''

    const totalPages = Math.ceil(totalItems / pageItems)
    if (totalPages <= 1) return
    const prevButton = document.createElement("button")
    prevButton.className = "btn btn-action"
    prevButton.innerHTML = '<i class="icon icon-arrow-left"></i>'
    prevButton.disabled = currentPage === 1
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--
            fetchAdminProcessingComplaints()
        }
    })

    const nextButton = document.createElement("button")
    nextButton.className = "btn btn-action"
    nextButton.innerHTML = '<i class="icon icon-arrow-right"></i>'
    nextButton.disabled = currentPage === totalPages
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++
            fetchAdminProcessingComplaints()
        }
    })

    const pageInfo = document.createElement("span")
    pageInfo.className = "pagination-info"
    pageInfo.textContent = `${currentPage} / ${totalPages}`
    paginationContainer.appendChild(prevButton)
    paginationContainer.appendChild(pageInfo)
    paginationContainer.appendChild(nextButton)
}

const takeComplaint = async (complaintId) => {
    try {
        const response = await fetch('/takeComplaint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ complaintId })
        })
        const data = await response.json();
        if (data.success) {
            let adminMain = document.querySelector('.admin-main')
            let complaintId = adminMain.querySelector('.tile-title').textContent.match(/\d+/)[0];
            toast('toast-success', 'Вы взяли в работу обращение #' + complaintId + '!')
            const complaintElement = document.querySelector(`#complaint-${complaintId}`)
            startFetching(fetchAdminComplaintsInWork)
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


document.addEventListener('click', (event) => {
    if (event.target.classList.contains('takeInWork') && event.target.textContent === 'Взять в работу') {
        const complaintId = event.target.closest('.tile').querySelector('.tile-title').textContent.match(/\d+/)[0];
        takeComplaint(complaintId);
    }
})

setInterval(fetchAdminProcessingComplaints, 2000)
fetchAdminProcessingComplaints()
