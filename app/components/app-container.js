import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias, equal } from '@ember/object/computed';
import { set, computed } from '@ember/object';
import { on } from '@ember/object/evented';
import { EKMixin, EKOnInsertMixin, keyDown, keyUp } from 'ember-keyboard';
import move from 'ember-animated/motions/move';
import { easeOut, easeIn } from 'ember-animated/easings/cosine';

export default Component.extend(EKMixin, EKOnInsertMixin, {
  router: service(),
  itemSelector: service(),
  taskEditor: service(),
  classNames: ['l-container'],
  isShortcutsDialogOpen: false,
  isMoveDialogOpen: false,
  isDeadlineDialogOpen: false,
  isEditing: alias('taskEditor.hasTask'),
  hasSelected: alias('itemSelector.hasItems'),
  hasSelectedProjects: alias('itemSelector.hasProjects'),
  isInTrashList: equal('router.currentRouteName', 'trash'),

  canCreateTask: computed('router.currentRouteName', 'isEditing', function() {
    return !this.isEditing && !['upcoming', 'logbook', 'trash'].includes(this.router.currentRouteName);
  }),

  shortcutNewTask: on(keyDown('KeyN'), function() {
    this.createNewTask();
  }),

  shortcutShortcutsDialog: on(keyDown('shift+Slash'), function() {
    set(this, 'isShortcutsDialogOpen', true);
  }),

  shortcutDeleteSelected: on(keyUp('Backspace'), function() {
    this.deleteSelected();
  }),

  actions: {
    createNewTask() {
      this.createNewTask();
    },

    markSelectedAs(status) {
      this.markSelectedAs(status);
    },

    deleteSelected() {
      this.deleteSelected();
    },

    undeleteSelected() {
      if (!this.hasSelected) {
        return;
      }

      this.undeleteItems(this.itemSelector.items);
      this.itemSelector.clear();
    },

    setDeadlineForSelected(deadline) {
      if (!this.hasSelected) {
        return;
      }

      this.setItemsDeadline(this.itemSelector.items, deadline);
    },

    setSelectedWhen(when, date) {
      if (!this.hasSelected) {
        return;
      }

      this.setItemsWhen(this.itemSelector.items, when, date);
    },

    moveSelectedToInbox() {
      if (!this.hasSelected || this.hasSelectedProjects) {
        return;
      }

      this.moveTasksToInbox(this.itemSelector.items);
    },

    moveSelectedToProject(project) {
      if (!this.hasSelected || this.hasSelectedProjects) {
        return;
      }

      this.moveTasksToProject(this.itemSelector.items, project);
    }
  },

  createNewTask() {
    if (!this.canCreateTask) {
      return;
    }

    let newTask = this.createTask();
    this.itemSelector.selectOnly(newTask);
    setTimeout(() => this.taskEditor.edit(newTask), 1);
  },

  markSelectedAs(status) {
    if (!this.hasSelected) {
      return;
    }

    this.markItemsAs(this.itemSelector.items, status);
    this.itemSelector.clear();
  },

  deleteSelected() {
    if (!this.hasSelected) {
      return;
    }

    this.deleteItems(this.itemSelector.items);
    this.itemSelector.clear();
  },

  * transition({ insertedSprites, removedSprites }) {
    insertedSprites.forEach(sprite => {
      sprite.startAtPixel({ y: window.innerHeight });
      move(sprite, { easing: easeOut });
    });

    removedSprites.forEach(sprite => {
      sprite.endAtPixel({ y: window.innerHeight });
      move(sprite, { easing: easeIn });
    });
  }
});
