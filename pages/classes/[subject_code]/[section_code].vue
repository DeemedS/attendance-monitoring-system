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
                    <p>Total Classes : <span>{{ classCount }}</span></p>
                </div>

                <div class="table-container">
                    <table id="student-table">
                        <thead>
                            <tr>
                                <th>INDEX</th>
                                <th>DATE</th>
                                <th>START TIME</th>
                                <th>END TIME</th>
                                <th>EDIT</th>

                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(classItem, index) in classArray" :key="classItem.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ convertDateToLocale(classItem.class_date) }}</td>
                                <td>{{ classItem.start_time }}</td>
                                <td>{{ classItem.end_time }}</td>
                                <td><a :href="'/editclass/' + subject_code + '/' + section_code + '/' + classItem.id">Edit</a></td>
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
        classArray.value = classes.value.classes;
        classCount.value = classArray.length;
    }
};



onMounted(async () => {
    await fetchSubject();
    await fetchClasses();
});

</script>
