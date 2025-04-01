fetchComplaints = () => {
    fetch('/getAllComplaints', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.complaints) {
                updateComplaintsList(data.complaints);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
}

 updateComplaintsList = (complaints) => {
    const complaintsContainer = document.querySelector('tbody')
    complaintsContainer.innerHTML = ''
    if (complaints.length === 0) {
        complaintsContainer.innerHTML = '<p>Жалоб нет...</p><div class="loading loading-lg"></div>'
        return;
    }
    complaints.forEach(complaint => {
        const complaintElement = document.createElement('tr')
        complaintElement.classList.add('tr-tbody')
        complaintElement.innerHTML = `
            <td>${complaint.id}</td>
            <td>${complaint.department}</td>
            <td>${complaint.problem_category}</td>
            <td>
                <span>${complaint.first_name}</span>
                <span>${complaint.surname}</span>
            </td>
            <td class="status pending">В обработке</td>
            <td>2024-03-18</td>
            <td>
                <button class="btn btn-primary btn-sm">Взять в работу</button>
            </td>
        `;
        complaintsContainer.appendChild(complaintElement);
    });
}

setInterval(fetchComplaints, 2000);
fetchComplaints();
