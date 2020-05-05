<template>
  <v-container class="schedule-container">
    <!-- <v-col class="mb-5 actions" cols="12">
      <v-btn v-if="!isSignedIn" @click="signIn()">Sign In</v-btn>
      <v-btn v-if="isSignedIn" @click="signOut()">Sign Out</v-btn>
      <v-btn @click="getClasses()">Get Classes</v-btn>
    </v-col> -->
    <v-row>
      <v-col cols="6" class="schedule">
        <v-card>
          <v-card-title>Schedule for {{ today }}</v-card-title>
          <v-simple-table>
            <template v-slot:default>
              <tbody>
                <tr v-for="(timeSlot, i) in schedule" :key="timeSlot.hour+timeSlot.scheduleItem">
                  <td class="text-left col-1">{{ timeSlot.hour }}</td>
                  <td @click="timeSlot.showMenu = true"
                    @mouseover="actions[i].addButton = !timeSlot.scheduleItem"
                    @mouseleave="actions[i].addButton = false">
                    <drop tag="div" style="width:100%;height:40px;" class="d-flex flex-row align-center"
                      @drop="handleDrop($event, i)">
                      <div>
                        <div v-if="timeSlot.scheduleItem">
                          <drag :transfer-data="{ item: timeSlot.scheduleItem, index: i }">
                            <span v-if="timeSlot.scheduleItem.alternateLink"><a target="_blank" :href="timeSlot.scheduleItem.alternateLink">{{ timeSlot.scheduleItem.title }}</a></span>
                            <span v-else>{{ timeSlot.scheduleItem.title }}</span>
                            &nbsp;<v-icon small @click="removeScheduleItem(timeSlot)">mdi-delete</v-icon>
                          </drag>
                        </div>
                      </div>
                      <div v-if="!timeSlot.scheduleItem && actions[i].addButton && !actions[i].showInput" small @click="actions[i].showInput = true"
                       style="display:flex;flex:1 1 100%">
                        Click to add
                      </div>
                      <div v-if="!timeSlot.scheduleItem && actions[i].showInput">
                        <v-row>
                          <v-col><v-text-field class="inline" v-model="newHomeAssignment" hide-details /></v-col>
                          <!-- <v-col class="d-flex"></v-col> -->
                          <v-col cols="3" class="d-flex">
                            <v-btn x-small class="primary align-self-center" @click="addHomeAssignment(timeSlot, i)">Add</v-btn>
                            <v-btn x-small class="ml-1 align-self-center" @click="actions[i].showInput = false">Cancel</v-btn>
                          </v-col>
                        </v-row>
                      </div>
                    </drop>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card>
      </v-col>
      <v-col cols="6" class="assignments">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>Home Stuff</span>
            <!-- <v-icon small @click="showAddHomeAssignment = true">mdi-plus</v-icon> -->
          </v-card-title>
          <v-list>
            <!-- <v-subheader class="d-flex justify-space-between">
              <span>Home Stuff</span>
              <v-icon small @click="showAddHomeAssignment = true">mdi-plus</v-icon>
            </v-subheader> -->
            <v-list-item v-for="(assignment, i) in homeAssignments" :key="assignment.title">
              <v-list-item-content>
                <drag :transfer-data="assignment" class="d-flex justify-space-between">
                  <v-list-item-title v-html="assignment.title"></v-list-item-title>
                  <v-icon small @click="removeHomeAssignment(i)">mdi-close</v-icon>
                </drag>
              </v-list-item-content>
            </v-list-item>
            <!-- <v-list-item v-if="showAddHomeAssignment">
              <v-list-item-content>
                <v-text-field v-model="newHomeAssignment" />
                <v-btn class="primary" @click="addHomeAssignment()">Add</v-btn>
                <v-btn class="mt-2" @click="showAddHomeAssignment = false">Cancel</v-btn>
              </v-list-item-content>
            </v-list-item> -->
          </v-list>
        </v-card>
        <v-card class="mt-1">
          <v-card-title  class="justify-space-between">
            <!-- <span>School Stuff</span> -->
            <v-col cols="9" v-if="viewMode == 'table'">
              <v-text-field
                v-model="searchText"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-col>
            <v-col class="text-right">
              <v-icon @click="viewMode = 'table'" class="mx-2">mdi-table</v-icon>
              <v-icon @click="viewMode = 'list'" class="mx-2">mdi-format-list-bulleted</v-icon>
            </v-col>
          </v-card-title>
          <v-list>
            <!-- <v-subheader class="justify-space-between">
              <span>School Stuff</span>
              <div v-if="viewMode == 'table'">
                <v-text-field
                  v-model="searchText"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </div>
              <div>
                <v-icon @click="viewMode = 'list'">mdi-format-list-bulleted</v-icon>
                <v-icon @click="viewMode = 'table'" class="ml-1">mdi-table</v-icon>
              </div>
            </v-subheader> -->
            <div v-if="viewMode == 'list'">
              <v-list-group color="primary" v-for="course in validCourses" :key="course.hash" sub-group>
                <template v-slot:activator>
                  <v-list-item-title>{{ course.name }} ({{ course.assignments.length }}) <a :href="course.alternateLink" target="_blank"><v-icon x-small>mdi-open-in-new</v-icon></a></v-list-item-title>
                </template>
                <v-list-item v-for="(assignment) in course.assignments" :key="assignment.title">
                  <v-list-item-content>
                    <drag :transfer-data="assignment">
                      <!-- <v-list-item-title v-html="assignment.title"></v-list-item-title> -->
                      <a :href="assignment.alternateLink" target="_blank">{{ assignment.title }}</a>
                    </drag>
                  </v-list-item-content>
                </v-list-item>
              </v-list-group>
            </div>
            <div v-if="viewMode == 'table'">
              <!-- <v-simple-table class="assignment-list">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Assignment</th>
                      <th class="text-left">Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in filteredAssignments" :key="item.id">
                      <td>
                        <drag :transfer-data="item">
                          {{ item.title }}
                          <div>
                            <small>{{ item.courseTitle }}</small>
                          </div>
                        </drag>
                      </td>
                      <td>{{ formatDate(item.dueDate) }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table> -->
              <!-- <v-data-table
                :headers="headers"
                :items="filteredAssignments"
                group-by="courseTitle"
              >
                <template v-slot:group.header="groupHeader">
                  <th colspan="2">{{ groupHeader.group }}</th>
                </template>

                <template v-slot:item="row">
                  <tr>
                    <td>
                      <drag :transfer-data="row.item">
                        <a target="_blank" :href="row.item.alternateLink">{{ row.item.title }}</a>
                      </drag>
                    </td>
                    <td>{{ formatDate(row.item.dueDate) }}</td>
                  </tr>
                </template>
              </v-data-table> -->
              <v-data-table
                class="assignment-list"
                :headers="headers"
                :headers-length="2"
                :custom-filter="filterTable"
                :items="filteredAssignments"
                :itemsPerPage="20"
                :search="searchText"
              >
                <template v-slot:item="row">
                  <tr>
                    <td>
                      <drag :transfer-data="row.item">
                        <a target="_blank" :href="row.item.alternateLink">{{ row.item.title }}</a>
                        <div>
                          <small>{{ row.item.courseTitle }}</small>
                        </div>
                      </drag>
                    </td>
                    <td>{{ formatDate(row.item.dueDate) }}</td>
                  </tr>
                </template>
              </v-data-table>
            </div>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Drag, Drop } from 'vue-drag-drop';

type HourSlot = {
  hour: string;
  scheduleItem: any;
  showMenu: boolean;
}

@Component({
  components: {
    Drag,
    Drop
  }
})
export default class Schedule extends Vue {
  @Prop() private msg!: string;

  public schedule: HourSlot[] = [];
  public courses: any[] = [];
  public homeAssignments: any[] = [];
  public allAssignments: any[] = [];
  public actions: any = {};
  // public showAddHomeAssignment = false;
  public newHomeAssignment = '';
  public viewMode: 'list' | 'table' = 'table';
  public headers: any[] = [
    {
      text: 'Assignment', align: 'start', value: 'title',
    },
    { text: 'Due', value: 'dueDate' },
  ];

  public isSignedIn = false;
  public searchText = '';

  get today () {
    const today = new Date();
    return today.getMonth() + 1 + '/' + today.getDate();
  }

  get validCourses () {
    return this.courses.filter(c => c.assignments.length > 0);
  }

  get filteredAssignments () {
    this.allAssignments.sort((a, b) => a.title < b.title ? -1 : 1);
    return this.allAssignments;
  }

  constructor () {
    super();

    const hours = [
      '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM',
      '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
      '5:00 PM', '5:30 PM', '6:00 PM'
    ];
    hours.forEach((hour, index) => {
      this.schedule.push({
        hour,
        showMenu: false,
        scheduleItem: {
          title: ''
        },
      } as HourSlot);
      this.actions[index] = {
        addButton: false,
        showInput: false
      }
    });

    this.homeAssignments.push({
      title: 'Chores'
    })
  }

  public loadSchedule () {
    const scheduleJson = window.localStorage.getItem('schedule');
    if (scheduleJson) {
      this.schedule = JSON.parse(scheduleJson);
    }

    const homeAssignmentsJson = window.localStorage.getItem('homeassignments');
    if (homeAssignmentsJson) {
      this.homeAssignments = JSON.parse(homeAssignmentsJson);
    }
  }

  public mounted () {
    this.loadSchedule();
    this.$eventHub.$on('is_logged_in', (isLoggedIn: boolean) => {
      this.isSignedIn = isLoggedIn;
      this.getClasses();
    });
    if (this.isSignedIn) {
      this.getClasses();
    }
  }

  public beforeDestroy () {
    this.$eventHub.$off('is_logged_in');
  }

  public async signIn () {
    await this.$auth.signIn();
  }

  public async signOut () {
    await this.$auth.signOut();
  }

  public async getClasses () {
    const apiRequest = {
      path: 'https://classroom.googleapis.com/v1/courses',
    };
    const response = await this.$auth.client.request(apiRequest);
    this.courses = response.result.courses.map((c: any) => {
      return {
        id: c.id,
        hash: c.id,
        name: c.name,
        alternateLink: c.alternateLink,
        assignments: [],
      };
    });
    this.courses.sort((a, b) => a.name < b.name ? -1 : 1);
    this.getTeachers();
    this.getCourseWork();
    this.getCourseTopics();
    this.getAnnouncements();
  }

  public async getTeachers () {
    for (const course of this.courses) {
      const apiRequest = {
        path: `https://classroom.googleapis.com/v1/courses/${course.id}/teachers`,
      };
      this.$auth.client.request(apiRequest).then((response: any) => {
        course.teacher = response.result.teachers[0].profile.name.fullName;
        course.hash = course.id + course.teacher;
      });
    }
  }

  public async getCourse () {
    // for (const course of this.courses) {
    //   const apiRequest = {
    //     path: `https://classroom.googleapis.com/v1/courses/${course.id}`,
    //   };
    //   this.$auth.client.request(apiRequest).then((response: any) => {
    //     const c = response.result;
    //   });
    // }
  }

  public async getCourseWork () {
    for (let i = 0; i < this.courses.length; i++) {
      const course = this.courses[i];
      const apiRequest = {
        path: `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`,
      };
      this.$auth.client.request(apiRequest).then((response: any) => {
        course.assignments = response.result.courseWork || [];
        if (course.assignments) {
          course.assignments.forEach((c: any) => (c.courseTitle = course.name));
          course.hash = course.id + course.teacher + course.assignments.length;
          this.allAssignments.push(...course.assignments);
        }
      });
    }
  }

  public async getCourseTopics () {
    for (const course of this.courses) {
      const apiRequest = {
        path: `https://classroom.googleapis.com/v1/courses/${course.id}/topics`,
      };
      this.$auth.client.request(apiRequest).then((response: any) => {
        course.topics = response.result.topics || [];
        if (course.topics) {
          course.hash = course.hash + course.topics.length;
        }
      });
    }
  }

  public async getAnnouncements () {
    for (const course of this.courses) {
      const apiRequest = {
        path: `https://classroom.googleapis.com/v1/courses/${course.id}/announcements`,
      };
      this.$auth.client.request(apiRequest).then((response: any) => {
        course.announcements = response.result.announcements || [];
        if (course.announcements) {
          course.hash += course.announcements.length + '';
        }
      });
    }
  }

  public handleDrop (data: any, index: number) {
    if (typeof data.item !== 'undefined') {
      this.schedule[data.index].scheduleItem = null;
      this.schedule[index].scheduleItem = data.item;
    } else {
      this.schedule[index].scheduleItem = data;
    }
    this.persist('schedule');
  }

  public removeScheduleItem (slot: any) {
    slot.scheduleItem = null;
    this.persist('schedule');
  }

  public addHomeAssignment (timeSlot: HourSlot, index: number) {
    timeSlot.scheduleItem = {
      title: this.newHomeAssignment
    }
    this.newHomeAssignment = '';
    if (this.homeAssignments.filter(x => x.title === timeSlot.scheduleItem.title).length === 0) {
      this.homeAssignments.push(timeSlot.scheduleItem);
    }
    this.persist('home');
    this.actions[index].showInput = false;
  }

  public removeHomeAssignment (index: number) {
    this.homeAssignments.splice(index, 1);
    this.persist('home');
  }

  public persist (key: 'schedule' | 'home') {
    switch (key) {
      case 'home':
        window.localStorage.setItem('homeassignments', JSON.stringify(this.homeAssignments));
        break
      case 'schedule':
        window.localStorage.setItem('schedule', JSON.stringify(this.schedule));
        break;
    }
  }

  public formatDate (dateObject: any): string {
    if (!dateObject) return '';
    return `${dateObject.month}/${dateObject.day}/${dateObject.year}`;
  }

  public filterTable (value: any, searchString: string | null, item: any) {
    if (!searchString) return false;
    return item.title.toLowerCase().indexOf(searchString.toLowerCase()) > -1 || item.courseTitle.toLowerCase().indexOf(searchString.toLowerCase()) > -1;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$tableBorderColor: #ddd;
.time-slot {
  border: solid 1px $tableBorderColor;
  border-bottom: none;
  &:last-child {
    border-bottom: solid 1px $tableBorderColor;
  }
}
.col-1 {
  width: 100px;
  border-right: solid 1px $tableBorderColor;
}

.schedule-container {
  .v-list-item__title {
    text-align: left;
  }
}

.v-data-table.assignment-list td {
  height: 60px;
  vertical-align: top;
  padding-top: 8px;
}

@media print {
  .schedule {
    max-width: 100%;
    flex: 0 0 100%;
  }
  .actions, .assignments {
    display:none;
  }

  .v-data-table td {
    height: 38px;

    a {
      text-decoration: none;
    }
    .v-icon {
      display: none;
    }
  }
}
</style>
