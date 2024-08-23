function searchTable() {
    let filter = document.getElementById('search-box').value.toUpperCase();
    let table = document.getElementById("student-table");
    let tr = table.getElementsByTagName("tr");


    for (let i = 1; i < tr.length; i++) { 
        let td = tr[i].getElementsByTagName("td")[1];
        if (td) {
            let txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}


// Function to handle the submission of attendance
function submitAttendance() {
    alert('Attendance submitted successfully!');
    // Implement submission logic here (e.g., saving to a database)
}

 
// Add event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('search-box').addEventListener('keyup', searchTable);

    // Add event listeners to each status button for updating status
    const statusButtons = document.querySelectorAll('.status-btn');
    statusButtons.forEach(button => {
        button.addEventListener('click', function() {
            const status = button.classList.contains('present') ? 'present' :
                          button.classList.contains('absent') ? 'absent' :
                          'excused';
            updateStatus(button, status);
        });
    });

    // Example function for submitting attendance
    document.querySelector('.submit-btn').addEventListener('click', submitAttendance);
});



// Function to handle the submission of attendance
function submitAttendance() {
    const attendanceData = [];
    
    const rows = document.querySelectorAll('#student-table tbody tr');
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    rows.forEach((row, index) => {
        const studentName = row.querySelector('td:nth-child(2)').textContent.trim();
        const studentId = row.querySelector('td:nth-child(3)').textContent.trim();
        const statusBtn = row.querySelector('.status-btn.selected').textContent.trim();

        attendanceData.push({ name: studentName, id: studentId, status: statusBtn });
    });

    // Store the attendance data in localStorage
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    
    // Display the attendance summary in a modal
    displayAttendanceSummary(attendanceData, today);
}

function displayAttendanceSummary(data, date) {
    let summaryHtml = `<h3>Attendance Summary - ${date}</h3><ol>`;
    data.forEach((entry, index) => {
        summaryHtml += `<li>${entry.name} (${entry.id}): ${entry.status}</li>`;
    });
    summaryHtml += '</ol>';

    document.querySelector('.modal-content').innerHTML = summaryHtml;
    document.querySelector('.modal').style.display = 'block';
}

// Close the modal
function closeModal() {
    document.querySelector('.modal').style.display = 'none';
}   

