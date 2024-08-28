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

                <div v-if="loadingContent" class="table-container">
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
                    </table>
                    <tbody>

                        <p>Getting data please wait...</p>

                    </tbody>
                </div>

                <div v-if="!loadingContent" class="table-container">
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
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const { subject_code, section_code } = route.params;

const subjectId = ref(null);
const studentsArray = ref([]);
const classesCount = ref(0);
const presentCount = ref(0);
const holidayCount = ref(0);
const noClassCount = ref(0);
const absentCount = ref(0);
const excusedCount = ref(0);
const attendanceData = ref({});
const loadingContent = ref(true);

const fetchData = async () => {

    try {
        const [subject, students] = await Promise.all([
            $fetch('/api/subjects', {
                method: 'POST',
                body: { subject_code, section_code },
            }),
            $fetch('/api/students', {
                method: 'POST',
                body: { section_code, subject_code },
            }),
        ]);

        subjectId.value = subject;
        studentsArray.value = students?.students.sort((a, b) => a.last_name.localeCompare(b.last_name));

        if (!subjectId.value || studentsArray.value.length === 0) {
            router.push('/');
        }


    } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push('/');
    }
};


const fetchClasses = async () => {
    try {
        const classes = await $fetch('/api/classes', {
            method: 'POST',
            body: {
                subject_id: subjectId.value,
                section_code,
            },
        });

        const classesArray = classes?.classes || [];

        classesCount.value = classesArray.length;

        for (const classData of classesArray) {
            await fetchAttendance(classData.id);
        }

    } catch (error) {
        console.error('Failed to fetch classes:', error);
    }
};


const fetchAttendance = async (class_id) => {
    try {
        const attendance = await $fetch('/api/attendance', {
            method: 'POST',
            body: {
                class_id,
            },
        });

        const attendanceArray = attendance?.attendance || [];

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

    } catch (error) {
        console.error('Failed to fetch attendance:', error);
    }
};

onMounted(async () => {
    setTimeout(async () => {
        await fetchData();
        await fetchClasses();
        loadingContent.value = false;
    }, 1000);
});

</script>
