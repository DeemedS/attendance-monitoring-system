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
                                <th>
                                    <div class="header-with-icon">
                                        <span>PRESENTS</span>
                                        <button @click="changeSort('presents')">
                                            <FontAwesomeIcon v-if="presentSortDir === 'default'" :icon="faSort" />
                                            <FontAwesomeIcon
                                                v-if="presentSortCol === 'presents' && presentSortDir === 'asc'"
                                                :icon="faSortUp" />
                                            <FontAwesomeIcon
                                                v-if="presentSortCol === 'presents' && presentSortDir === 'desc'"
                                                :icon="faSortDown" />
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div class="header-with-icon">
                                        <span>ABSENTS</span>
                                        <button @click="changeSort('absents')">
                                            <FontAwesomeIcon v-if="absentSortDir === 'default'" :icon="faSort" />
                                            <FontAwesomeIcon
                                                v-if="absentSortCol === 'absents' && absentSortDir === 'asc'"
                                                :icon="faSortUp" />
                                            <FontAwesomeIcon
                                                v-if="absentSortCol === 'absents' && absentSortDir === 'desc'"
                                                :icon="faSortDown" />
                                        </button>
                                    </div>
                                </th>
                                <th>
                                    <div class="header-with-icon">
                                        <span>EXCUSED</span>
                                        <button @click="changeSort('excused')">
                                            <FontAwesomeIcon v-if="excusedSortDir === 'default'" :icon="faSort" />
                                            <FontAwesomeIcon
                                                v-if="excusedSortCol === 'excused' && excusedSortDir === 'asc'"
                                                :icon="faSortUp" />
                                            <FontAwesomeIcon
                                                v-if="excusedSortCol === 'excused' && excusedSortDir === 'desc'"
                                                :icon="faSortDown" />
                                        </button>
                                    </div>
                                </th>
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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';


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

const presentSortCol = ref('');
const absentSortCol = ref('');
const excusedSortCol = ref('');
const presentSortDir = ref('default');
const absentSortDir = ref('default');
const excusedSortDir = ref('default');

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

function changeSort(column) {
    if (column === 'presents') {

        switch (presentSortDir.value) {
            case 'default':
                presentSortDir.value = 'asc';
                presentSortCol.value = 'presents';
                studentsArray.value = studentsArray.value.sort((a, b) => {
                    return attendanceData.value[b.student_number]?.present - attendanceData.value[a.student_number]?.present;
                });

                break;
            case 'asc':
                presentSortDir.value = 'desc';
                presentSortCol.value = 'presents';

                studentsArray.value = studentsArray.value.sort((a, b) => {
                    return attendanceData.value[a.student_number]?.present - attendanceData.value[b.student_number]?.present;
                });
                break;
            case 'desc':
                presentSortDir.value = 'default';
                presentSortCol.value = 'presents';
                studentsArray.value = studentsArray.value.sort((a, b) => {
                    return a.last_name.localeCompare(b.last_name);
                });
                break;
        }
    } else if (column === 'absents') {
        switch (absentSortDir.value) {
            case 'default':
                absentSortDir.value = 'asc';
                absentSortCol.value = 'absents';
                studentsArray.value = studentsArray.value.sort((a, b) => {
                    return attendanceData.value[b.student_number]?.absent - attendanceData.value[a.student_number]?.absent;
                });

                break;
            case 'asc':
                absentSortDir.value = 'desc';
                absentSortCol.value = 'absents';
                studentsArray.value = studentsArray.value.sort((a, b) => {
                    return attendanceData.value[a.student_number]?.absent - attendanceData.value[b.student_number]?.absent;
                });

                break;
            case 'desc':
                absentSortDir.value = 'default';
                absentSortCol.value = 'absents';
                studentsArray.value = studentsArray.value.sort((a, b) => {
                    return a.last_name.localeCompare(b.last_name);
                });
                break;
        }
    } else if (column === 'excused') {
        switch (excusedSortDir.value) {
            case 'default':
                excusedSortDir.value = 'asc';
                excusedSortCol.value = 'excused';
                studentsArray.value = studentsArray.value.sort((a, b) => {
                    return attendanceData.value[b.student_number]?.excused - attendanceData.value[a.student_number]?.excused;
                });

                break;
            case 'asc':
                excusedSortDir.value = 'desc';
                excusedSortCol.value = 'excused';
                studentsArray.value = studentsArray.value.sort((a, b) => {
                    return attendanceData.value[a.student_number]?.excused - attendanceData.value[b.student_number]?.excused;
                });

                break;
            case 'desc':
                excusedSortDir.value = 'default';
                excusedSortCol.value = 'excused';
                studentsArray.value = studentsArray.value.sort((a, b) => {
                    return a.last_name.localeCompare(b.last_name);
                });
                break;
        }
    }
}

onMounted(async () => {
    await fetchData();
    loadingContent.value = false;
});
</script>