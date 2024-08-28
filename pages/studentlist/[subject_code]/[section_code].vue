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
                    <p>Getting data, please wait...</p>
                </div>

                <div v-else class="table-container">
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
                                <td>{{ attendanceData[student.student_number]?.present || 0 }}</td>
                                <td>{{ attendanceData[student.student_number]?.absent || 0 }}</td>
                                <td>{{ attendanceData[student.student_number]?.excused || 0 }}</td>
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
import { ref, onMounted } from "vue";
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
const loadingContent = ref(true);

const fetchAttendance = async (classIds) => {
    try {
        const attendancePromises = classIds.map(class_id => $fetch('/api/attendance', {
            method: 'POST',
            body: { class_id }
        }));

        const attendances = await Promise.all(attendancePromises);

        attendances.forEach((attendance) => {
            const attendanceArray = attendance?.attendance || [];

            if (Object.keys(attendanceData.value).length === 0) {
                attendanceData.value = studentsArray.value.reduce((acc, student) => {
                    acc[student.student_number] = {
                        present: 0,
                        absent: 0,
                        excused: 0,
                        holiday: 0,
                        noClass: 0,
                    };
                    return acc;
                }, {});
            }

            attendanceArray.forEach((record) => {
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
        });
    } catch (error) {
        console.error("Failed to fetch attendance:", error);
    }
};

const fetchData = async () => {
    try {
        const studentListData = await $fetch("/api/subjects", {
            method: "POST",
            body: {
                formAction: "GETSTUDENTSLISTDATA",
                subject_code,
                section_code,
            },
        });

        const students = studentListData.students || [];
        studentsArray.value = students.sort((a, b) => a.last_name.localeCompare(b.last_name));

        const classesArray = studentListData.classes || [];
        classesCount.value = classesArray.length;

        if (studentsArray.value.length === 0) {
            return router.replace("/");
        }

        const classIds = classesArray.map(classData => classData.id);
        await fetchAttendance(classIds);

    } catch (error) {
        console.error("Failed to fetch data:", error);
        router.replace("/");
    }
};

onMounted(async () => {
    await fetchData();
    loadingContent.value = false;
});
</script>
