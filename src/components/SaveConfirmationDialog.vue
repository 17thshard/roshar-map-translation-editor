<template>
  <div class="save-confirmation-dialog">
    <div class="dg-content-body">
      <template v-if="messageHasTitle">
        <h2 v-if="options.html" class="dg-title" v-html="messageTitle" />
        <h2 v-else class="dg-title">
          {{ messageTitle }}
        </h2>
      </template>
      <div v-if="options.html" class="dg-content" v-html="messageBody" />
      <div v-else class="dg-content">
        {{ messageBody }}
      </div>
    </div>
    <div class="dg-buttons">
      <button type="button" class="dg-btn" @click="cancel">
        Cancel
      </button>
      <button type="button" class="dg-btn dg-btn--red dg-btn--pull-right" @click="proceed('discard')">
        Discard
      </button>
      <button type="button" class="dg-btn dg-btn--primary" @click="proceed('save')">
        Save
      </button>
    </div>
  </div>
</template>

<script>
import VueDialogMixin from 'vuejs-dialog/dist/vuejs-dialog-mixin.min'

export default {
  name: 'SaveConfirmationDialog',
  mixins: [VueDialogMixin]
}
</script>
