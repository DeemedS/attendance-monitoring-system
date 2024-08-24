<template>
    <div class="flex flex-col container-fluid items-center justify-center h-[100vh] max-w-[1200px]">
        <div class="dashboard-box">

            <Sidebar />

            <main class="main-content">
                <header class="page-header">
                    <h2>LIST</h2>
                    <div class="search-container">
                        <input type="text" id="search-box" placeholder="Search...">
                    </div>
                    <span class="date">{{ convertDateToLocale(new Date()) }}</span>
                </header>

                <div class="totals flex flex-row gap-2">
                    <p>Total Classes: <span>{{ classesCount }}</span></p>
                    <p class="total-holiday">Holidays: <span>{{ holidayCount }}</span></p>
                    <p class="total-no-class">No Classes: <span>{{ noClassCount }}</span></p>
                    <p class="total-absent">Absents: <span>{{ absentCount }}</span></p>
                    <p class="total-excused">Total Excused: <span>{{ excusedCount }}</span></p>
                </div>

                <div class="table-container">
                    <table id="student-table">
                        <thead>
                            <tr>
                                <th>INDEX</th>
                                <th>STUDENT NAME</th>
                                <th>STUDENT NUMBER</th>
                                <th>PRESENTS</th>
                                <th>ABSENTS</th>
                                <th>EXCUSED</th>
                                <th>EDIT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(student, index) in studentsArray" :key="student.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ student.last_name }}, {{ student.first_name }}</td>
                                <td>{{ student.student_number }}</td>
                                <td> {{ attendanceData[student.student_number]?.present || 0 }}</td>
                                <td> {{ attendanceData[student.student_number]?.absent || 0 }}</td>
                                <td> {{ attendanceData[student.student_number]?.excused || 0 }}</td>
                                <td><a :href="'/attendance-list/' + student.student_number">Edit</a></td>
                            </tr>
                        </tbody>
                    </table>
                </div>




            </main>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const { subject_code, section_code } = route.params;

const studentsArray = ref([]);
const classesCount = ref(0);
const presentCount = ref(0);
const holidayCount = ref(0);
const noClassCount = ref(0);
const absentCount = ref(0);
const excusedCount = ref(0);
const attendanceData = ref({});

const fetchSubject = async () => {
    try {
        const { data: subject, error: subjectError } = await useFetch('/api/subjects', {
            method: 'POST',
            body: {
                subject_code: subject_code,
                section_code: section_code,
            }
        });

        if (subject.value?.statusCode === 500) {
            router.push('/');
        }
    } catch (error) {
        router.push('/');
    }
};


const fetchStudents = async () => {
    const { data: students, error: studentsError } = await useFetch('/api/students', {
        method: 'POST',
        body: {
            section_code: section_code,
        }
    });

    if (studentsError.value) {
        console.error('Failed to fetch students:', studentsError.value);
    } else {
        studentsArray.value = students.value?.students.sort((a, b) => a.last_name.localeCompare(b.last_name));
    }
};


const fetchClasses = async () => {
    const { data: classes, error: classesError } = await useFetch('/api/classes', {
        method: 'POST',
        body: {
            subject_code: subject_code,
            section_code: section_code,
        }
    });

    if (classesError.value) {
        console.error('Failed to fetch classes:', classesError.value);
    } else {
        const classesArray = classes.value?.classes || [];

        console.log('Classes:', classesArray);

        classesCount.value = classesArray.length;

        for (const classData of classesArray) {
            console.log('Fetching attendance for class:', classData.id);
            await fetchAttendance(classData.id);
        }

    }
};


const fetchAttendance = async (class_id) => {

    console.log('Fetching attendance for class:', class_id);
    const { data: attendance, error: attendanceError } = await useFetch('/api/attendance', {
        method: 'POST',
        body: {
            class_id: class_id,
        }
    });

    if (attendanceError.value) {
        console.error('Failed to fetch attendance:', attendanceError.value);
    } else {
        const attendanceArray = attendance.value?.attendance || [];

        if (Object.keys(attendanceData.value).length === 0) {
            attendanceData.value = studentsArray.value.reduce((acc, student) => {
                acc[student.student_number] = { present: 0, absent: 0, excused: 0, holiday: 0, noClass: 0 };
                return acc;
            }, {});
        }

        attendanceArray.forEach(record => {
            const studentAttendance = attendanceData.value[record.student_number];
            if (studentAttendance) {
                studentAttendance[record.status.toLowerCase()]++;
            }
        });

        noClassCount.value += attendanceArray.filter(record => record.status === 'no-class').length;
        holidayCount.value += attendanceArray.filter(record => record.status === 'holiday').length;
        presentCount.value += attendanceArray.filter(record => record.status === 'present').length;
        absentCount.value += attendanceArray.filter(record => record.status === 'absent').length;
        excusedCount.value += attendanceArray.filter(record => record.status === 'excused').length;
    }
};

onMounted(async () => {
    await fetchSubject();
    await fetchStudents();
    await fetchClasses();
});

</script>
