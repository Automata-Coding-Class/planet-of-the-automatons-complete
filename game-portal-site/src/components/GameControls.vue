<template>
    <div class="component game-controls">
        <h3>Game Setup</h3>
        <form class="control-group">
            <fieldset class="control-group" :disabled="newGameButtonDisabled">
                <span class="control-group"><input type="text" id="newGameColumnsInput" v-model="newGameColumns"><label for="newGameColumnsInput">columns</label></span>
                <span class="decorator">X</span>
                <span class="control-group"><input type="text" id="newGameRowsInput" v-model="newGameRows"/><label for="newGameRowsInput">rows</label></span>
            </fieldset>
            <b-button size="sm" variant="secondary" @click="newGame" :disabled="newGameButtonDisabled">New Game</b-button>
        </form>
        <span class="control-group transport">
            <span><button class="stop" @click="stopButtonAction" :disabled="stopButtonDisabled"><span class="icon"><span class="label">Stop</span></span></button></span>
            <span><button class="pause" @click="playButtonAction" :disabled="pauseButtonDisabled"><span class="icon"><span class="label">{{ playButtonText }}</span></span></button></span>
            <span><button class="play" @click="playButtonAction" :disabled="playButtonDisabled"><span class="icon"><span class="label">{{ playButtonText }}</span></span></button></span>
        </span>
        <span class="status">{{ gameStatus }}</span>
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
        return !(/^(unknown|initialized|stopped|error)/i).test(this.$store.state.stateMachine.gameStatus); // !== 'stopped';
      },
      playButtonText: function() {
        const key = (/^[a-z]+/).exec(this.$store.state.stateMachine.gameStatus)[0];
        switch(key) {
          case 'awaiting':
            return 'Pause Game';
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
          case 'running':
          case 'awaitingFrameResponse':
          case 'stopped':
          case 'error':
            return true;
            break;
          default:
            return false;
            break;
        }
      },
      pauseButtonDisabled: function() {
        switch(this.$store.state.stateMachine.gameStatus) {
          case 'unknown':
          case 'initialized':
          case 'starting':
          case 'paused':
          case 'stopped':
          case 'error':
            return true;
            break;
          default:
            return false;
            break;
        }
      },
      stopButtonDisabled: function() {
        switch(this.$store.state.stateMachine.gameStatus) {
          case 'unknown':
          case 'initialized':
          case 'stopped':
          case 'error':
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
        // debugger;
        if(key === 'initialized') {
            this.$store.dispatch('stateMachine/startGame', this.$store.state.gameEvents.connectedPlayerList);
        } else if(key === 'paused') {
          console.log(`gonna resume that!`);
          this.$store.dispatch('stateMachine/resumeGame');
        }  else if(!(/^(stopped|error)/i).test(key)) {
          this.$store.dispatch('stateMachine/pauseGame');
        }
      },
      stopButtonAction() {
        this.$store.dispatch('stateMachine/stopGame');
      }
    }
  }
</script>

<style scoped>

</style>
