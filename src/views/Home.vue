<template>
  <div class="home">
    <Schedule msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import Schedule from '@/components/Schedule.vue'

export default {
  name: 'Home',
  components: {
    Schedule,
  },
}
</script>
