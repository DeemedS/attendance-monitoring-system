<template>
    <div class="weekly-calendar">
      <div class="navigation">
        <button @click="previousPage" :disabled="currentPage === 0">Previous</button>
        <button @click="nextPage" :disabled="!canNavigateNext">Next</button>
      </div>
      <div class="header">
        <div class="time-slot"></div>
        <div v-for="(day, index) in paginatedDays" :key="index" class="day-header">
          {{ formatDate(day) }}
        </div>
      </div>
      <div class="body">
        <div class="time-column">
          <div v-for="hour in hours" :key="hour" class="time-slot">
            {{ formatTime(hour) }}
          </div>
        </div>
        <div class="days-column">
          <div v-for="(day, dayIndex) in paginatedDays" :key="dayIndex" class="day-column">
            <div
              v-for="hour in hours"
              :key="hour"
              class="time-slot"
              @click="selectSlot(day, hour)"
            >
              <div v-if="isSelectedSlot(day, hour)" class="selected-event">
                Event
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        days: this.getDateRange(new Date(2024, 6, 22), new Date(2024, 8, 4)), // Dates from July 22 to Sep 4, 2024
        hours: Array.from({ length: 24 }, (_, i) => i), // 24 hours
        selectedSlots: [], // To store selected time slots
        currentPage: 0, // Current page index
        pageSize: 5, // Number of days per page
      };
    },
    computed: {
      paginatedDays() {
        const start = this.currentPage * this.pageSize;
        const end = start + this.pageSize;
        return this.days.slice(start, end);
      },
      canNavigateNext() {
        return this.currentPage < Math.floor(this.days.length / this.pageSize);
      },
    },
    methods: {
      getDateRange(startDate, endDate) {
        const dateArray = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          // Skip Sundays
          if (currentDate.getDay() !== 0) {
            dateArray.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return dateArray;
      },
      formatDate(date) {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      },
      formatTime(hour) {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hourFormatted = hour % 12 || 12;
        return `${hourFormatted}:00 ${ampm}`;
      },
      selectSlot(day, hour) {
        this.selectedSlots.push({ day, hour });
      },
      isSelectedSlot(day, hour) {
        return this.selectedSlots.some(
          (slot) => slot.day.getTime() === day.getTime() && slot.hour === hour
        );
      },
      nextPage() {
        if (this.canNavigateNext) {
          this.currentPage++;
        }
      },
      previousPage() {
        if (this.currentPage > 0) {
          this.currentPage--;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .weekly-calendar {
    display: flex;
    flex-direction: column;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .navigation {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  
  .header {
    display: flex;
  }
  
  .day-header {
    flex: 1;
    padding: 10px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #ddd;
    background-color: #f9f9f9;
  }
  
  .body {
    display: flex;
  }
  
  .time-column {
    width: 80px;
  }
  
  .time-slot {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #ddd;
    cursor: pointer;
  }
  
  .days-column {
    display: flex;
    flex: 1;
  }
  
  .day-column {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .selected-event {
    background-color: #4caf50;
    color: white;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>
  