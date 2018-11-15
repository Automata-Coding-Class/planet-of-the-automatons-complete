<template>
  <div class="portal">
      <div class="content main">
          <GameBoard :rows="boardGrid.rows  " :columns="boardGrid.columns" :layout="layout"></GameBoard>
          <GameControls v-if="userIsAdmin"></GameControls>
          <SystemStatus></SystemStatus>
      </div>
      <div class="content sidebar">
          <p>[ the chat area will go here ]</p>
      </div>
  </div>
</template>

<script>
// @ is an alias to /src
import GameBoard from '@/components/GameBoard.vue';
import GameControls from '@/components/GameControls.vue';
import SystemStatus from '@/components/SystemStatus.vue';

import { mapState, mapGetters } from 'vuex';

export default {
  name: 'home',
  components: {
    GameBoard,
    GameControls,
    SystemStatus
  },
  computed: {
    ... mapState('stateMachine', ['boardGrid', 'layout']),
    ... mapGetters('authentication', ['userIsAdmin'])
  }
};
</script>
