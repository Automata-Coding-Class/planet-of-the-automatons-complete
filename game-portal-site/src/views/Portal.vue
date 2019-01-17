<template>
    <div class="portal">
        <div class="content main">
            <SystemStatus></SystemStatus>
            <GameBoard :rows="boardGrid.rows  " :columns="boardGrid.columns"
                       :layout="layout"></GameBoard>
            <div class="game-info">
                <GameControls v-if="userIsAdmin"></GameControls>
                <ScoreBoard></ScoreBoard>
            </div>
        </div>
        <div class="content sidebar">
            <p>[ the chat area will go here ]</p>
        </div>
    </div>
</template>

<script>
  // @ is an alias to /src
  import GameBoard from '@/components/GameBoard.vue';
  import ScoreBoard from '@/components/ScoreBoard';
  import GameControls from '@/components/GameControls.vue';
  import SystemStatus from '@/components/SystemStatus.vue';

  import {mapState, mapGetters} from 'vuex';

  export default {
    name: 'home',
    components: {
      GameBoard,
      ScoreBoard,
      GameControls,
      SystemStatus
    },
    computed: {
      ...mapState('stateMachine', ['boardGrid', 'layout']),
      ...mapGetters('authentication', ['userIsAdmin'])
    }
  };
</script>
