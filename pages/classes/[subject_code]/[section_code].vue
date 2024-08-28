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
                    <p>Total Classes: <span>{{ classCount }}</span></p>
                    <p>No Classes: <span>{{ noClassCount }}</span></p>
                    <p>Holidays: <span>{{ holidayCount }}</span></p>
                </div>

                <div v-if="loadingContent" class="table-container">
                    <p>Getting data, please wait...</p>
                </div>

                <div v-else class="table-container">
                    <table id="student-table">
                        <thead>
                            <tr>
                                <th>INDEX</th>
                                <th>DATE</th>
                                <th>PRESENT</th>
                                <th>ABSENT</th>
                                <th>EXCUSED</th>
                                <th>REMARKS</th>
                                <th>EDIT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(classItem, index) in classArray" :key="classItem.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ convertDateToLocale(classItem.class_date) }}</td>
                                <td>{{ classItem.presentCount }}</td>
                                <td>{{ classItem.absentCount }}</td>
                                <td>{{ classItem.excusedCount }}</td>
                                <td>{{ classItem.remarks }}</td>
                                <td><a :href="'/attendance/' + classItem.id">Edit</a></td>
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

const classArray = ref([]);
const classCount = ref(0);
const subjectId = ref(null);
const loadingContent = ref(true);
const noClassCount = ref(0);
const holidayCount = ref(0);


const fetchSubject = async () => {
    try {
        const subject = await $fetch('/api/subjects', {
            method: 'POST',
            body: {
                formAction: 'getSubjectId',
                subject_code,
                section_code,
            },
        });

        subjectId.value = subject;

    } catch (error) {
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

        for (const classItem of classes.classes) {
            const { presentCount, absentCount, excusedCount } = await fetchAttendance(classItem.id);
            classArray.value.push({ ...classItem, presentCount, absentCount, excusedCount });
        }

        classArray.value.sort((a, b) => new Date(a.class_date) - new Date(b.class_date));

        const noClasses = classArray.value.filter(item => item.remarks === 'No class').length;
        const Holiday = classArray.value.filter(item => item.remarks === 'Holiday').length;


        noClassCount.value = noClasses;
        holidayCount.value = Holiday;
        classCount.value = classArray.value.length;



    } catch (error) {
        console.error('Failed to fetch classes:', error);
    }


};

const fetchAttendance = async (class_id) => {

    try {

        const attendance = await $fetch('/api/attendance', {
            method: 'POST',
            body: { class_id: class_id },
        });

        const attendanceArray = attendance.attendance || [];

        const presentCount = attendanceArray.filter(student => student.status === 'present').length;
        const absentCount = attendanceArray.filter(student => student.status === 'absent').length;
        const excusedCount = attendanceArray.filter(student => student.status === 'excused').length;

        return { presentCount, absentCount, excusedCount };

    } catch (error) {
        console.error('Failed to fetch attendance:', error);
        return { presentCount: 0, absentCount: 0, excusedCount: 0 };

    }



};

onMounted(async () => {
    await fetchSubject();
    await fetchClasses();
    loadingContent.value = false;
});
</script>
