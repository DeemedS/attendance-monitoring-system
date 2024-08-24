<template>
    <div class="flex flex-col container-fluid items-center justify-center h-[100vh] max-w-[1200px]">
        <div class="dashboard-box">
            <Sidebar />

            <main class="main-content">
                <header class="page-header">
                    <h2>LIST</h2>
                    <div class="search-container">
                        <input type="text" id="search-box" placeholder="Search..." />
                    </div>
                    <span class="date">{{ convertDateToLocale(classDate) }}</span>
                </header>

                <div class="actions">
                    <label>Mark all students as:</label>
                    <button class="status-btn present" @click="markAllStudents('present')">Present</button>
                    <button class="status-btn absent" @click="markAllStudents('absent')">Absent</button>
                    <button class="status-btn excused" @click="markAllStudents('excused')">Excused</button>
                    <button class="status-btn holiday" @click="markAllStudents('holiday')">Holiday</button>
                    <button class="status-btn no-class" @click="markAllStudents('no-class')">No Class</button>

                    <button v-if="!loading" class="submit-btn" @click="submitAttendance">Submit Attendance</button>
                    <button v-if="loading" class="submit-btn items-center cursor-not-allowed opacity-50" disabled>
                        <div class="loader"></div>
                    </button>
                </div>

                <div class="totals flex flex-row gap-2">
                    <p>Total Students: <span>{{ totalStudents }}</span></p>
                    <p class="total-present">Total Present: <span>{{ totalPresent }}</span></p>
                    <p class="total-absent">Total Absent: <span>{{ totalAbsent }}</span></p>
                    <p class="total-excused">Total Excused: <span>{{ totalExcused }}</span></p>
                </div>

                <div class="table-container">
                    <table id="student-table">
                        <thead>
                            <tr>
                                <th>QTY</th>
                                <th>STUDENT NAME</th>
                                <th>SECTION</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(student, index) in students" :key="student.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ student.last_name }}, {{ student.first_name }}</td>
                                <td>{{ student.section_code }}</td>
                                <td>
                                    <button class="status-btn present"
                                        :class="{ selected: student.status === 'present' }"
                                        @click="updateStatus(student, 'present')">
                                        P
                                    </button>
                                    <button class="status-btn absent" :class="{ selected: student.status === 'absent' }"
                                        @click="updateStatus(student, 'absent')">
                                        A
                                    </button>
                                    <button class="status-btn excused"
                                        :class="{ selected: student.status === 'excused' }"
                                        @click="updateStatus(student, 'excused')">
                                        E
                                    </button>
                                    <button class="status-btn holiday"
                                        :class="{ selected: student.status === 'holiday' }"
                                        @click="updateStatus(student, 'holiday')">
                                        H
                                    </button>
                                    <button class="status-btn no-class"
                                        :class="{ selected: student.status === 'no-class' }"
                                        @click="updateStatus(student, 'no-class')">
                                        N
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    </div>
    <Toast />
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const students = ref([]);
const classDate = ref(null);
const sectionCode = ref(null);
const subjectCode = ref(null);
const attendance = ref([]);
const loading = ref(false);
const error = ref(null);
const { showToast } = useToast();

// Fetch students data

const { data: classData } = await useFetch('/api/classes', {
        method: 'POST',
        body: {
            class_id: route.params.class_id,
        },
    });

classDate.value = classData.value.class.class_date;
sectionCode.value = classData.value.class.section_code;
subjectCode.value = classData.value.class.subject_code;

const { data: studentsData } = await useFetch('/api/students', {
    method: 'POST',
    body: {
        section_code: sectionCode.value
    },
});

students.value = studentsData.value.students.sort((a, b) => a.last_name.localeCompare(b.last_name));

try {
    const { data: classData } = await useFetch('/api/classes', {
        method: 'POST',
        body: {
            class_id: route.params.class_id,
        },
    });
    classDate.value = classData.value.class.class_date;

} catch (err) {
    console.error('Failed to fetch class data:', err);
}

try {
    const { data: attendanceData } = await useFetch('/api/attendance', {
        method: 'POST',
        body: {
            class_id: route.params.class_id,
        },
    });

    attendance.value = attendanceData.value.attendance;


    students.value.forEach(student => {
        const record = attendance.value.find(
            record => record.student_number === student.student_number
            
        );
        student.status = record ? record.status : "";
        student.attendance_id = record ? record.id : null;
    });
} catch (err) {
    error.value = 'Failed to fetch attendance';
}

function markAllStudents(status) {
    students.value.forEach((student) => {
        student.status = status;
    });
}

function updateStatus(student, status) {
    student.status = status;
}


const totalStudents = computed(() => students.value.length);

const totalPresent = computed(() =>
    students.value.filter(student => student.status === 'present').length
);

const totalAbsent = computed(() =>
    students.value.filter(student => student.status === 'absent').length
);

const totalExcused = computed(() =>
    students.value.filter(student => student.status === 'excused').length
);

async function submitAttendance() {

    loading.value = true;

    try {
        const response = await useFetch('/api/submitAttendance', {
            method: 'POST',
            body: {
                attendance: students.value.map((student, index) => ({
                    id: student.attendance_id,
                    student_number: student.student_number,
                    status: student.status,
                    class_id: route.params.class_id,
                }))
            }
        });

        if (response.data.value.statusCode === 200) {
            loading.value = false;
            showToast('Attendance submitted successfully', 'success');

        } else {
            console.error('Failed to submit attendance:', response.data.value.message);
        }

    } catch (error) {
        console.error('Error submitting attendance:', error);
    }
}



</script>