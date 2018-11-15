<template>
    <div class="component game-controls">
        <span class="control-group"><button @click="newGame">New Game</button> with
            <span class="control-group"><input type="text" id="newGameRowsInput" v-model="newGameRows"/>
                <label for="newGameRowsInput">rows</label></span>
        and <span class="control-group"><input type="text" id="newGameColumnsInput" v-model="newGameColumns">
                <label for="newGameColumnsInput">columns</label></span></span>
        <span><button>Start Game</button></span>
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
    },
    methods: {
      newGame() {
        this.$store.dispatch('stateMachine/requestNewGame', {rows: this.newGameRows, columns: this.newGameColumns})
      }
    }
  }
</script>

<style scoped>

</style>
