<template>
    <div class="component system-status">
        <h3>System Status</h3>
        <div><span class="label">Player list: </span>
            <ul class="player-list"><li class="player" v-for="player in playerList">{{player.username}}</li></ul>
        </div>
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
      ... mapState('gameEvents', ['eventLog', 'playerList']),
      recentEvents() {
        return this.eventLog.slice(0,5);
      }
    },
    mounted() {
      // this.getPlayerList();
    },
    methods: {
      formatTime(date) {
        return timeStampFormat(date);
      },
      getPlayerList() {
        this.$store.dispatch('gameEvents/refreshPlayerList');
      }
    }
  }
</script>

<style scoped>

</style>
