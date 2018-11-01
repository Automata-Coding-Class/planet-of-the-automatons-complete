<template>
  <div class="portal">
      <div class="content main">
          <GameBoard></GameBoard>
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
import SystemStatus from '@/components/SystemStatus.vue';

export default {
  name: 'home',
  components: {
    GameBoard,
    SystemStatus
  },
};
</script>
