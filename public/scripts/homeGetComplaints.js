let currentComplaints = [];

function fetchUserComplaints() {
    fetch('/getUserComplaints', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.complaints) {
                data.complaints.sort((a, b) => a.id - b.id);
                if (currentComplaints.length === 0 ||
                    JSON.stringify(currentComplaints) !== JSON.stringify(data.complaints)) {
                    updateComplaintsList(data.complaints);
                } else {
                    updateUnfinishedComplaints(data.complaints);
                }

                currentComplaints = data.complaints;
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function updateComplaintsList(complaints) {
    let complaintsContainer = document.querySelector('.complaint-status');
    complaintsContainer.innerHTML = `
    <ul style="margin-bottom: 20px" class="tab tab-block">
          <li class="tab-item">
          <form action="">
            <button type="submit">Обращения в работе</button>
          </form>
          </li>
          <li class="tab-item">
          <form action="">
             <button type="submit">История</button>
          </form>
          </li>
    </ul>
    `;

    if (complaints.length === 0) {
        complaintsContainer.innerHTML = '<p style="color: #fff; text-align: center">У вас пока нет отправленных обращений &#128524;</p>';
        return;
    }

    complaints.forEach(complaint => {
        createComplaintElement(complaintsContainer, complaint);
    });
}
function updateUnfinishedComplaints(complaints) {
    complaints.forEach(complaint => {
        if (complaint.status !== 'Выполнено') {
            const existingElement = document.querySelector(`#Tile${complaint.id}`);
            if (existingElement) {
                const tempContainer = document.createElement('div');
                createComplaintElement(tempContainer, complaint);
                const newElement = tempContainer.querySelector(`#Tile${complaint.id}`);
                if (existingElement.innerHTML !== newElement.innerHTML) {
                    existingElement.parentNode.replaceChild(newElement, existingElement);
                }
            } else {
                const complaintsContainer = document.querySelector('.complaint-status');
                createComplaintElement(complaintsContainer, complaint);
            }
        }
    });
}
function createComplaintElement(container, complaint) {
    let complaintElement = document.createElement('div');
    complaintElement.classList.add('tile');
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
        </div>
    `;
    container.appendChild(complaintElement);
}

fetchUserComplaints();
const updateInterval = setInterval(fetchUserComplaints, 1900);

function checkAllComplaintsFinished() {
    if (currentComplaints.every(c => c.status === 'Выполнено')) {
        clearInterval(updateInterval);
    }
}