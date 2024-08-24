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
                </div>

                <div class="table-container">
                    <table id="student-table">
                        <thead>
                            <tr>
                                <th>INDEX</th>
                                <th>DATE</th>
                                <th>START TIME</th>
                                <th>END TIME</th>
                                <th>PRESENT</th>
                                <th>ABSENT</th>
                                <th>EXCUSED</th>
                                <th>EDIT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(classItem, index) in classArray" :key="classItem.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ convertDateToLocale(classItem.class_date) }}</td>
                                <td>{{ classItem.start_time }}</td>
                                <td>{{ classItem.end_time }}</td>
                                <td>{{ classItem.presentCount }}</td>
                                <td>{{ classItem.absentCount }}</td>
                                <td>{{ classItem.excusedCount }}</td>
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

        for (const classItem of classes.value.classes) {
            const { presentCount, absentCount, excusedCount } = await fetchAttendance(classItem.id);
            classArray.value.push({ ...classItem, presentCount, absentCount, excusedCount });
        }

        classArray.value.sort((a, b) => new Date(a.class_date) - new Date(b.class_date));
        
        classCount.value = classArray.value.length;
    }
};

const fetchAttendance = async (class_id) => {
    console.log('Fetching attendance for class:', class_id);
    const { data: attendance, error: attendanceError } = await useFetch('/api/attendance', {
        method: 'POST',
        body: { class_id: class_id },
    });

    console.log('Attendance:', attendance.value);

    if (attendanceError.value) {
        console.error('Failed to fetch attendance:', attendanceError.value);
        return { presentCount: 0, absentCount: 0, excusedCount: 0 };
    } else {
        const attendanceArray = attendance.value.attendance || [];

        const presentCount = attendanceArray.filter(student => student.status === 'present').length;
        const absentCount = attendanceArray.filter(student => student.status === 'absent').length;
        const excusedCount = attendanceArray.filter(student => student.status === 'excused').length;

        return { presentCount, absentCount, excusedCount };
    }
};

onMounted(async () => {
    await fetchSubject();
    await fetchClasses();
});
</script>
