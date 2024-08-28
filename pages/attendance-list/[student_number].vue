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

                <div class="flex flex-row items-center">
                    <button class="submit-btn" @click="backToList">Back</button>
                </div>

                <div v-if="loadingContent" class="flex flex-col items-center mb-2">
                    <h4>Getting data, please wait...</h4>
                </div>

                <div v-else class="flex flex-col items-center mb-2">
                    <h4>{{ studentInfos.first_name + " " + studentInfos.last_name }}</h4>
                    <p>{{ studentInfos.section_code }}</p>
                </div>

                <div class="table-container">
                    <table id="student-table">
                        <thead>
                            <tr>
                                <th>QTY</th>
                                <th>DATE</th>
                                <th>START TIME</th>
                                <th>END TIME</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(classItem, index) in classInfos" :key="classItem.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ convertDateToLocale(classItem.class.class_date) }}</td>
                                <td>{{ classItem.class.start_time }}</td>
                                <td>{{ classItem.class.end_time }}</td>
                                <td>
                                    <button class="status-btn present"
                                        :class="{ selected: classItem.status === 'present' }"
                                        @click="updateStatus(classItem, 'present')">
                                        P
                                    </button>
                                    <button class="status-btn absent"
                                        :class="{ selected: classItem.status === 'absent' }"
                                        @click="updateStatus(classItem, 'absent')">
                                        A
                                    </button>
                                    <button class="status-btn excused"
                                        :class="{ selected: classItem.status === 'excused' }"
                                        @click="updateStatus(classItem, 'excused')">
                                        E
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
import { ref } from "vue";
import { useToast } from "@/composables/useToast";

const route = useRoute();
const router = useRouter();

const { student_number } = route.params;
const classDate = ref(new Date());

const { showToast } = useToast();
const studentInfos = ref({
    first_name: "",
    last_name: "",
    section_code: "",
});
const classInfos = ref([]);
const section_code = ref("");
const subject_code = ref("");
const loadingContent = ref(true);

const fetchStudentInfo = async () => {
    try {
        const response = await $fetch(`/api/students`, {
            method: "POST",
            body: { student_number },
        });
        studentInfos.value = response;
    } catch (error) {
        console.error("Failed to fetch student info:", error);
    }
};

const fetchClassData = async () => {
    try {
        const response = await $fetch(`/api/attendance/`, {
            method: "POST",
            body: { student_number },
        });

    
        classInfos.value = response
            .filter((item) => item.status !== 'no-class' && item.status !== 'holiday')
            .sort((a, b) => new Date(a.class.class_date) - new Date(b.class.class_date));

        if (classInfos.value.length > 0) {
            section_code.value = classInfos.value[0].class.subjects.section_code;
            subject_code.value = classInfos.value[0].class.subjects.subject_code;
        }
    } catch (error) {
        console.error("Failed to fetch class data:", error);
    }
};

onMounted(async () => {
    await fetchStudentInfo();
    await fetchClassData();
    loadingContent.value = false;
});

const updateStatus = async (classItem, status) => {
    try {
        classItem.status = status;

        const response = await $fetch(`/api/attendance/updateStudent`, {
            method: "POST",
            body: {
                attendance_id: classItem.id,
                status,
            },
        });

        if (response.statusCode === 200) {
            showToast(
                convertDateToLocale(response.class_date) + " : " + response.message,
                "success"
            );
        } else {
            showToast("Failed to update status", "danger");
        }
    } catch (error) {
        showToast("An unexpected error occurred", "danger");
        console.error(error);
    }
};

const backToList = () => {
    router.push("/studentlist/" + subject_code.value + "/" + section_code.value);
};
</script>
