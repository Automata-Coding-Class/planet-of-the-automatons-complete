<template>
    <div class="component system-status">
        <h3>System Status</h3>
        <h4>Event Log</h4>
        <ul>
            <li v-for="entry in recentEvents">{{entry.type}} - {{formatTime(entry.timestamp)}}:
                {{entry.payload}}
            </li>
        </ul>
    </div>
</template>

<script>
  import {mapState} from 'vuex';
  import {timeStampFormat} from "../format-utils";

  export default {
    name: "SystemStatus",
    computed: {
      ... mapState('gameEvents', ['eventLog']),
      recentEvents() {
        return this.eventLog.slice(0,5);
      }
    },
    methods: {
      formatTime(date) {
        return timeStampFormat(date);
      }
    }
  }
</script>

<style scoped>

</style>
