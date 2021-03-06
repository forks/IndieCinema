<template>
  <div class="add-new-channel-wrapper">
    <div class="add-new-channel">
      <label>Add channel</label>
      <input autofocus autocomplete="off" placeholder="e.g. eoadaily" v-model="newChannel" @keyup.enter="addChannel()">
      <svg class="icon icon-plus" @click="addChannel()">
        <use xlink:href="/assets/images/symbols_defs.svg#icon-plus"></use>
      </svg>
    </div>
  </div>
  <div class="action-bar clearfix">
    <div class="query-channels">
      <h5>Current channels:</h5>
      <ul>
        <li class="channel label" v-for="channel in sharedState.queryChannels">
          <svg class="channel-visibility icon icon-eye" :class="{'inactive' : this.sharedState.hiddenChannels.indexOf(channel) !== -1}" v-show="!deleteChannels" @click="hideChannel(channel)" @click.stop>
            <use xlink:href="/assets/images/symbols_defs.svg#icon-eye"></use>
          </svg>
          <svg class="close icon icon-cross" v-show="deleteChannels" @click="removeChannel(channel)" @click.stop>
            <use xlink:href="/assets/images/symbols_defs.svg#icon-cross"></use>
          </svg>
          <span class="channel-name">{{ channel }}</span>
        </li>
      </ul>
    </div>
    <div class="options">
      <svg class="delete-channels icon icon-bin" :class="{'active' : deleteChannels}" @click="allowRemoval()">
        <use xlink:href="/assets/images/symbols_defs.svg#icon-bin"></use>
      </svg>
    </div>
  </div>
</template>

<script>
'use strict';
import store from '../store';

const localStorage = window.localStorage;

// Accepts array of objects and removes duplicates
function removeDuplicates(array, prop) {
  var uniqueArray = [];
  var uniqueObject = {};
  var arrayLength = array.length;

  // Generate objects identified by prop as key
  for (var i = 0; i < arrayLength; i++) {
    uniqueObject[array[i][prop]] = array[i];
  }
  // Insert objects into array
  for (i = 0 in uniqueObject) {
    uniqueArray.push(uniqueObject[i]);
  }
  return uniqueArray;
}

export default {
  data: function() {
    return {
      newChannel: '', // Placeholder for new channel
      deleteChannels: false, // Option to delete channel
      sharedState: store.state // Global store
    };
  },
  methods: {
    addChannel() {
      // Remove whitespace on ends
      var addChannel = this.newChannel.trim();

      // Check if there is a valid(ish) value
      if (!addChannel) {
        return store.setMessage('Channel name can not be empty');
      }

      if (/^[a-zA-Z\u00C0-\u017F]+,\s[a-zA-Z\u00C0-\u017F]+$/.test(addChannel)) {
        return store.setMessage('Channel name can not contain accented characters');
      }

      // Check if channel already exists in the array of channels
      if (this.sharedState.queryChannels.indexOf(addChannel) !== -1) {
        return store.setMessage('This channel is already present');
      }

      var movies = this.sharedState.movieList; // Get list of already showed movies
      store.setLoading(true);

      this.$http({
        url: '/api/get-videos-single?channel=' + addChannel,
        method: 'GET'
      }).then(function(response) {
        // Add videos to array
        movies = movies.concat(response.data);
        // Clear duplicates
        var uniqueMovies = removeDuplicates(movies, 'uri');
        // Update list of videos
        store.setMovies(uniqueMovies);
        // Turn off loading
        store.setLoading(false);
        // Add channel to the array with channels
        store.addQueryChannel(addChannel);
        localStorage.setItem('myChannels', JSON.stringify(this.sharedState.queryChannels));
      }, function(error) {
        // Turn off loading
        store.setLoading(false);
        return store.setMessage(error.data.message);
      });
      // Clear input
      this.newChannel = '';
    },
    allowRemoval() {
      if (this.deleteChannels === false) {
        return this.$set('deleteChannels', true);
      }
      this.$set('deleteChannels', false);
    },
    removeChannel(channel) {
      store.removeQueryChannel(channel);

      if (!this.sharedState.queryChannels.length > 0) {
        store.setMovies([]);
      }
      localStorage.setItem('myChannels', JSON.stringify(this.sharedState.queryChannels));

      // After channel is removed, filter out movies that belong to that channel - no query
      var movies = this.sharedState.movieList;
      var queryChannels = this.sharedState.queryChannels;

      function filterByExistingChannel(movie) {
        if (queryChannels.indexOf(movie.indieCinema.channel) !== -1) {
          return true;
        }
      }
      var cleanMovies = movies.filter(filterByExistingChannel);
      store.setMovies(cleanMovies);
    },
    hideChannel(channel) {
      store.toggleHideChannel(channel);
      localStorage.setItem('hiddenChannels', JSON.stringify(this.sharedState.hiddenChannels));
    }
  },
  created: function() {
    // Get list of channels
    var customChannels = localStorage.getItem('myChannels');
    if (customChannels) {
      customChannels = JSON.parse(customChannels);
      store.setQueryChannels(customChannels);
    } else {
      var exampleChannels = ['staffpicks', 'everythinganimated', '5vimeobest']; // Just a taste of channels, less overwhalming than a group
      store.setQueryChannels(exampleChannels);
    }
    // Get list of hidden channels
    var hiddenChannels = JSON.parse(localStorage.getItem('hiddenChannels'));
    if (hiddenChannels) {
      store.setHiddenChannels(hiddenChannels);
    }
  },
  ready: function() {
    store.getMovies();
  }
};
</script>

<style lang="scss">
@import "./utils/sass/styling";
.add-new-channel-wrapper {
  text-align: center;
  @include bp(md) {
    margin: 2rem 0 0 0;
    font-size: 2.5rem;
  }
  @include bp(lg) {
    margin: 4rem 0 0 0;
    font-size: 3rem;
  }
}

.add-new-channel {
  display: inline-block;
  text-align: center;
  margin: auto;
  label {
    display: block;
    text-align: left;
    margin: auto auto .5rem 1.5rem;
    font-size: .95rem;
    font-weight: 600;
    color: $dark;
  }
  input {
    height: 48px;
    border-radius: 1000px;
    border: 2px solid rgba($dark, .25);
    padding: 0 1.5rem;
    vertical-align: top;
    font-size: .95rem;
    font-style: italic;
    width: 200px;
    transition: border-color .2s ease-in;
    &:focus {
      outline: 0;
      border-color: $primary;
    }
    @include bp(md) {
      width: 500px;
    }
  }
  .icon {
    height: 2rem;
    width: 2rem;
    margin-top: 10px;
    color: rgba($primary, .25);
    transition: color .2s ease-in;
    &:hover {
      cursor: pointer;
      color: rgba($primary, 1);
    }
  }
}

.action-bar {
  padding: 0 1rem;
  margin: 2rem auto;
  @include bp(md) {
    padding: 0 2rem;
    margin: 4rem auto 2rem;
  }
  @include bp(xlg) {
    padding: 0 4rem;
    margin: 2rem auto 2rem;
  }
}

.query-channels {
  width: 70%;
  float: left;
  @include bp(xlg) {
    width: 70%;
    margin: 4rem 0 0 0;
  }
  h5 {
    font-size: .95rem;
    margin: 0 0 .5rem 0;
    color: rgba($dark, .5);
  }
  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
  li {
    display: inline-block;
    margin: .5rem 1rem .5rem 0;
    font-weight: 600;
    font-size: .95rem;
    @include bp(xlg) {
      margin: auto 1.5rem auto 0;
    }
  }
  .icon {
    height: .75rem;
    width: .75rem;
    margin: 3px 5px 0 0;
    float: left;
    cursor: pointer;
    color: rgba($dark, .25);
    transition: color .2s ease-in;
    &:hover,
    &:active {
      color: $primary;
    }
  }
  .channel-visibility {
    color: $primary;
    &.inactive {
      color: rgba($dark, .25);
    }
  }
  .channel-name {
    float: right;
    font-size: .95rem;
    text-transform: lowercase;
  }
}

.options {
  padding: 0 1rem;
  text-align: right;
  width: 15%;
  float: right;
  @include bp(md) {
    padding: 0;
  }
  @include bp(xlg) {
    padding: 0;
    margin: 4rem 0 0 0;
  }
  .icon {
    cursor: pointer;
    display: inline-block;
    color: rgba($dark, .25);
    transition: color .2s ease-in;
    &:hover,
    &:active {
      color: $primary;
      opacity: 1;
    }
  }
  .delete-channels.active {
    color: $warning;
  }
}
</style>
