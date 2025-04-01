document.getElementById('complaintForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const form = new FormData(this);
    fetch(this.action, {
        method: 'POST',
        body: form,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
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
