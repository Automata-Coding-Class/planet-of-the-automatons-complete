<template>
    <div class="component game-controls">
        <span class="control-group"><button @click="newGame" :disabled="newGameButtonDisabled">New Game</button> with
            <span class="control-group"><input type="text" id="newGameRowsInput" v-model="newGameRows"/>
                <label for="newGameRowsInput">rows</label></span>
        and <span class="control-group"><input type="text" id="newGameColumnsInput" v-model="newGameColumns">
                <label for="newGameColumnsInput">columns</label></span></span>
        <span><button @click="playButtonAction" :disabled="playButtonDisabled">{{ playButtonText }}</button></span>
        <span>status = {{ gameStatus }}</span>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

  export default {
    name: "GameControls",
    data: function() {
      return {

      }
    },
    computed: {
      newGameRows: {
        get: function() {
          return this.$store.state.stateMachine.newGameRows;
        },
        set: function(newValue) {
          this.$store.commit('stateMachine/newGameRowsChanged', newValue);
        }
      },
      newGameColumns: {
        get: function() {
          return this.$store.state.stateMachine.newGameColumns;
        },
        set: function(newValue) {
          this.$store.commit('stateMachine/newGameColumnsChanged', newValue);
        }
      },
      newGameButtonDisabled: function() {
        return this.$store.state.stateMachine.gameStatus !== 'stopped';
      },
      playButtonText: function() {
        const key = (/^[a-z]+/).exec(this.$store.state.stateMachine.gameStatus)[0];
        switch(key) {
          case 'awaiting':
            return 'Stop Game';
            break;
          default:
            return 'Start Game';
            break;
        }
      },
      playButtonDisabled: function() {
        switch(this.$store.state.stateMachine.gameStatus) {
          case 'unknown':
          case 'starting':
            return true;
            break;
          default:
            return false;
            break;
        }
      },
      ... mapState('stateMachine', ['gameStatus'])
    },
    methods: {
      newGame() {
        this.$store.dispatch('stateMachine/requestNewGame', {rows: this.newGameRows, columns: this.newGameColumns})
      },
      playButtonAction() {
        const key = (/^[a-z]+/).exec(this.$store.state.stateMachine.gameStatus)[0];
        if(key === 'stopped') {
            this.$store.dispatch('stateMachine/startGame', this.$store.state.gameEvents.playerList);
        }  else {
          this.$store.dispatch('stateMachine/stopGame');
        }
      }
    }
  }
</script>

<style scoped>

</style>
