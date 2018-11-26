<template>
    <div class="component system-status">
        <h3>System Status</h3>
        <div><span class="label">Player list: </span>
            <ul class="player-list">
                <li class="player"
                    :style="getPlayerStyle(player.userId)"
                    v-for="player in playerList">
                    <span :class="getPlayerIconClass(player.userId)">&nbsp;</span>
                    <span class="name">{{player.username}}</span>
                </li>
            </ul>
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
      ... mapState('stateMachine', ['playerAttributes']),
      recentEvents() {
        return this.eventLog.slice(0, 5);
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
      },
      // tried to implement these by 'decorating' the player objects in a computed property,
      // but Vue was not updating when the playerAttributes state changed
      getPlayerStyle(playerId) {
        if (this.playerAttributes[playerId] !== undefined) {
          return `color: ${this.playerAttributes[playerId].color}`;
        } else {
          return '';
        }
      },
      getPlayerIconClass(playerId) {
        if (this.playerAttributes[playerId] !== undefined) {
          return `fa fa-${this.playerAttributes[playerId].iconName}`;
        } else {
          return 'fa fa-square-full placeholder';
        }
      }
    }
  }
</script>

<style scoped>

</style>
