<template>
    <div class="component game-controls">
        <span class="control-group"><button @click="newGame">New Game</button> with
            <span class="control-group"><input type="text" id="newGameRowsInput" v-model="newGameRows"/>
                <label for="newGameRowsInput">rows</label></span>
        and <span class="control-group"><input type="text" id="newGameColumnsInput" v-model="newGameColumns">
                <label for="newGameColumnsInput">columns</label></span></span>
        <span><button @click="startGame" :disabled="playButtonDisabled">{{ playButtonText }}</button></span>
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
      playButtonText: function() {
        return 'Start Game';
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
      startGame() {
        this.$store.dispatch('stateMachine/startGame');
      }
    }
  }
</script>

<style scoped>

</style>
