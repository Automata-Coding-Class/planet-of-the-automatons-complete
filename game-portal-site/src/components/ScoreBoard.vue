<template>
    <div class="component score-board">
        <h3>Score Board</h3>
        <ul class="player-list">
            <li class="player"
                :style="getPlayerStyle(player)"
                v-for="player in players">
                <span class="icon" :class="getPlayerIconClass(player)">&nbsp;</span>
                <span class="name">{{player.username}}</span>
                <span class="score">{{player.score}}</span>
            </li>
            <li class="total">
                <span class="label">Combined</span>
                <span class="score">{{totalScore}}</span>
            </li>
            <li class="percent">
                <span class="label">Max possible: {{boardGrid.totalAssets}}</span>
                <span class="separator">&gt;</span>
                <span class="score">{{percentScore}}%</span>
            </li>
        </ul>
    </div>
</template>

<script>
  import {mapState, mapGetters} from 'vuex';

  export default {
    name: "ScoreBoard",
    computed: {
      ... mapState('gameEvents', ['eventLog', 'playerList']),
      ... mapState('stateMachine', ['boardGrid']),
      ... mapGetters('stateMachine', ['players']),
      totalScore() {
        return this.players.reduce((totalScore, player) => {
          totalScore += player.score;
          return totalScore;
        }, 0);
      },
      percentScore() {
        return this.boardGrid.totalAssets === 0 ? 0 : Math.round(1000 * this.totalScore / this.boardGrid.totalAssets) / 10;
      }
    },
    methods: {
      getPlayerList() {
        this.$store.dispatch('gameEvents/refreshPlayerList');
      },
      // tried to implement these by 'decorating' the player objects in a computed property,
      // but Vue was not updating when the playerAttributes state changed
      getPlayerStyle(player) {
           return `color: ${player.color ? player.color : 'gray'}`;
      },
      getPlayerIconClass(player) {
        return `fa fa-${player.iconName || 'fa fa-square-full placeholder'}`;
      },
    }
  }
</script>

<style scoped>

</style>
