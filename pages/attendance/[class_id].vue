<template>
    <div class="flex flex-col container-fluid items-center justify-center h-[100vh] max-w-[1200px]">
        <div class="dashboard-box">
            <main class="main-content">
                <header class="page-header">
                    <h2>LIST</h2>
                    <div class="search-container">
                        <input type="text" id="search-box" placeholder="Search..." />
                    </div>
                    <span class="date">{{ convertDateToLocale(classDate) }}</span>
                </header>

                <div class="actions">
                    <button class="submit-btn" @click="backToList">Go back</button>
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
                            <tr v-for="(student, index) in studentsArray" :key="student.id">
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
const router = useRouter();

const studentsArray = ref([]);
const classDate = ref(null);
const sectionCode = ref(null);
const subjectCode = ref(null);
const attendance = ref([]);
const loading = ref(false);
const error = ref(null);
const totalStudents = ref(0);
const totalPresent = ref(0);
const totalAbsent = ref(0);
const totalExcused = ref(0);

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

const getSubjectCode = async () => {

    try {
        const subjectData = await $fetch('/api/subjects', {
            method: 'POST',
            body: {
                formMethod: 'getSubjectCode',
                subject_id: classData.value.class.subject_id,
            },
        });

        subjectCode.value = subjectData.subject_code;

    } catch (error) {
        console.error('Failed to fetch subject code:', error);
    }

};



const fetchStudents = async () => {
    try {
        const students = await $fetch('/api/students', {
            method: 'POST',
            body: {
                section_code: sectionCode.value,
                subject_code: subjectCode.value
            },
        });

        studentsArray.value = students?.students.sort((a, b) => a.last_name.localeCompare(b.last_name));

    } catch (error) {
        console.error('Failed to fetch students:', error);
    }
};

const fetchClasses = async () => {
    try {
        const classData = await $fetch('/api/classes', {
            method: 'POST',
            body: {
                class_id: route.params.class_id,
            },
        });
        classDate.value = classData.class.class_date;

    } catch (err) {
        console.error('Failed to fetch class data:', err);
    }
};

const fetchAttendance = async () => {

    try {
        const attendanceData = await $fetch('/api/attendance', {
            method: 'POST',
            body: {
                class_id: route.params.class_id,
            },
        });

        attendance.value = attendanceData.attendance;


        studentsArray.value.forEach(student => {
            const record = attendance.value.find(
                record => record.student_number === student.student_number

            );
            student.status = record ? record.status : "";
            student.attendance_id = record ? record.id : null;
        });
    } catch (err) {
        error.value = 'Failed to fetch attendance';
    }
};

const getTotals = async () => {
    totalStudents.value = studentsArray.value.length;
    totalPresent.value = studentsArray.value.filter(student => student.status === 'present').length;
    totalAbsent.value = studentsArray.value.filter(student => student.status === 'absent').length;
    totalExcused.value = studentsArray.value.filter(student => student.status === 'excused').length;
};

function markAllStudents(status) {
    studentsArray.value.forEach((student) => {
        student.status = status;
    });
}

function updateStatus(student, status) {
    student.status = status;
}


const submitAttendance = async () => {

    loading.value = true;

    try {
        const response = await $fetch('/api/submitAttendance', {
            method: 'POST',
            body: {
                attendance: studentsArray.value.map((student, index) => ({
                    id: student.attendance_id,
                    student_number: student.student_number,
                    status: student.status,
                    class_id: route.params.class_id,
                }))
            }
        });

        if (response.statusCode === 200) {
            loading.value = false;
            showToast('Attendance submitted successfully', 'success');

        } else {
            loading.value = false;
            showToast('Failed to submit attendance', response.message);
        }

    } catch (error) {
        loading.value = false;
        showToast('Failed to submit attendance', 'error');
        console.error('Error submitting attendance:', error);
    }
}

function backToList() {
    router.push(`/classes/${subjectCode.value}/${sectionCode.value}`);
}

onMounted(async () => {
    setTimeout(async () => {
        await getSubjectCode();
        await fetchStudents();
        await fetchClasses();
        await fetchAttendance();
        await getTotals();
    }, 1000);

});


</script>